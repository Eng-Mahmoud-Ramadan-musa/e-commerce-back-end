import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { RefreshTokenDto, SigninAuthDto, SigninGoogleDto, SignupAuthDto , SigninStep2faDto, ConfirmEmailDto, ResetPasswordDto, sendOtpDto} from './dto';
import { UserRepository } from '../../DB';
import { compare, emailEmitter, generateOTP, TokenService, PROVIDERS, ROLES, SUBJECTS, IOtp, ImageSchema } from '../../Common';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ){}

  async signup(createAuthDto: SignupAuthDto) {
    const {userName, email, password, phone, DOB, image: profilePic} = createAuthDto;
    
    const user = await this.userRepository.userExist(email)
    if(user)  throw new ConflictException('user already exist')

    const userCreated = await this.userRepository.create({
    userName,
     email,
     password,
     phone,
     DOB,
     profilePic,
  })

    const otp = generateOTP(6);

    emailEmitter.emit("sendEmail", email, "confirm email",otp)

    userCreated.OTP.push({code: otp, subject: "confirm email", expiresIn: new Date()});
    await userCreated.save();
    return userCreated;
  }

async confirmEmail(confirmEmailDto: ConfirmEmailDto) {
  const { email, otp } = confirmEmailDto;
  
  const user = await this.userRepository.userExist(email)
  if (!user) throw new NotFoundException('user not found')
  if(user.isConfirmed === true) throw new BadRequestException('user already confirmed! Try login')
    const matchedOtp = user.OTP.find(
      obj => obj.code === otp && (obj.subject === SUBJECTS.ConfirmEmail || obj.subject === SUBJECTS.ResendOtp)
    );
    
    if (!matchedOtp) {
      throw new BadRequestException('Invalid OTP');
    }
  user.isConfirmed = true;
  await user.save();
  return true;
}

  async signin(signinAuthDto: SigninAuthDto) {
    const { email, password} = signinAuthDto
    const user = await this.userRepository.userExist( email )
    if(!user) throw new NotFoundException('user not found')
    if(!user.isConfirmed) throw new BadRequestException('email not confirmed')
    if(!(compare(password, user.password))) throw new NotFoundException('user not found!')
    if(user.isDeleted) {
      user.isDeleted = false;
      await user.save();
    }
      const accessToken = await this.tokenService.sign({
        userId: user._id,
        email: user.email,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      })

      const refreshToken = await this.tokenService.sign({
        userId: user._id,
        email: user.email,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d',
      })
   return {
  accessToken,
  refreshToken,
  user: {
    ...user.toObject(),
    password: undefined,
  },
};

}

async signinWithGoogle(signinGoogleDto: SigninGoogleDto) {
  const { idToken } = signinGoogleDto;
  const googleUser = await this.tokenService.verifyGoogleToken(idToken);

  // تحقق من أن الإيميل مفعل من Google (إن كانت خاصية موجودة)
  if (!googleUser.email || googleUser.email_verified === false) {
    throw new BadRequestException('Email not verified by Google.');
  }

  let user = await this.userRepository.userExist(googleUser.email);

  if (!user) {
    user = await this.userRepository.create({
      userName: googleUser.name,
      email: googleUser.email,
      provider: PROVIDERS.Google,
      role: ROLES.User,
      profilePic: googleUser.picture
        ? { secure_url: googleUser.picture } as ImageSchema
        : undefined,
      isConfirmed: true,
    });
  }
    user.isDeleted = false
    await user.save();

  // توليد التوكنات
  const accessToken = await this.tokenService.sign(
    {
      userId: user._id,
      email: user.email,
    },
    {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    },
  );

  const refreshToken = await this.tokenService.sign(
    {
      userId: user._id,
      email: user.email,
    },
    {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    },
  );

  return {
    accessToken,
    refreshToken,
    user: {
      ...user.toObject(),
      password: undefined,
    },
  };
}

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    
    const user = await this.tokenService.verify(refreshToken,
      { secret: process.env.JWT_SECRET}
    )
  
    const accessToken = await this.tokenService.sign({
      userId: user.userId,
      email: user.email,
    },
    {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    })
    return {accessToken};
  }

  async sendOtp(sendOtpDto: sendOtpDto) {
    const { email, subject } = sendOtpDto;
    
    const user = await this.userRepository.userExist(email)
    if(!user) throw new NotFoundException('user not found')

    if(subject === SUBJECTS.SignIn2fa && !user.enableStep_2fa) throw new BadRequestException('2FA not enabled')
    const otp = generateOTP(6)
    user.OTP.push({code: otp, subject, expiresIn: new Date()})
    await user.save();

    emailEmitter.emit("sendEmail", email, subject,otp)
    return {message: `send otp for ${subject} successfully`};
  }

  async resendOtp(email: string) {
    const user = await this.userRepository.userExist(email)
    
    if(!user) throw new NotFoundException(`user not found for this ${email}`)
    const otp = generateOTP(6)
    user.OTP.push({code: otp, subject: SUBJECTS.ResendOtp, expiresIn: new Date()})
    await user.save();

    emailEmitter.emit("sendEmail", email, SUBJECTS.ResendOtp,otp)
    return {message: `send otp for reset password successfully`};
  }

  async resetPassword(restPasswordDto: ResetPasswordDto) {
    const { email, password, otp } = restPasswordDto;

    const user = await this.userRepository.userExist(email)
    if(!user) throw new NotFoundException('user not found')
      
    const matchedOtp = user.OTP.find(
      obj => obj.code === otp && (obj.subject === SUBJECTS.ResetPassword || obj.subject === SUBJECTS.ResendOtp)
    );
    
    if (!matchedOtp) {
      throw new BadRequestException('Invalid OTP');
    }
    user.password = password;
    await user.save();

    return true;
  }

  async signinStep2fa(signinStep2faDto: SigninStep2faDto) {
    const { email, otp } = signinStep2faDto;
    const user = await this.userRepository.userExist(email)
    if(!user) throw new NotFoundException('user not found')

    if(!user.isConfirmed || user.isDeleted) {
      user.isConfirmed = true;
      user.isDeleted = false;
      await user.save();
    }

    if(!user.enableStep_2fa) throw new BadRequestException('step 2fa not enabled');
    const matchedOtp = user.OTP.find(
      (obj: IOtp) => obj.code === otp && (obj.subject === SUBJECTS.SignIn2fa || obj.subject === SUBJECTS.ResendOtp)
    )
      if (!matchedOtp) {
        throw new BadRequestException('Invalid OTP');
      }
    const accessToken = await this.tokenService.sign({
      userId: user._id,
      email: user.email,
    },
    {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    })

    const refreshToken = await this.tokenService.sign({
      userId: user._id,
      email: user.email,
    },
    {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    })

    return {accessToken ,refreshToken,   user: {
    ...user.toObject(),
    password: undefined,
  }};
  }


}
