import { Controller, Post, Body, HttpCode, UseInterceptors, Param, Get, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RefreshTokenDto, SigninAuthDto, SigninGoogleDto, SignupAuthDto, SigninStep2faDto, ConfirmEmailDto, ResetPasswordDto, sendOtpDto } from './dto';
import { UserFileUploadInterceptor, multerOptions } from '../../Common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UseInterceptors(FileInterceptor('profilePic', multerOptions()), UserFileUploadInterceptor('users'))
  async signup(@Body() signupAuthDto: SignupAuthDto) {
    const createUser = await this.authService.signup(signupAuthDto);
    return {message: 'user created successfully', data: createUser}
  }

  @Post('signin')
  @HttpCode(200)
  async signin(@Body() signAuthDto: SigninAuthDto) {
    const data = await this.authService.signin(signAuthDto);
    return {message: 'signin successfully', data}
  }

  @Post('confirm-email')
  @HttpCode(200)
  async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    await this.authService.confirmEmail(confirmEmailDto);
    return {message: 'email confirmed successfully, try login'}
  }

  @Post('signin-with-google')
  @HttpCode(200)
  async signinWithGoogle(@Body() signGoogleDto: SigninGoogleDto) {
    const data = await this.authService.signinWithGoogle(signGoogleDto);
    return {message: 'signin successfully', data}

  }

  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshTokenDto);
  }

  @Post('send-otp')
  @HttpCode(200)
  async forgotPassword(@Body() sendOtpDto: sendOtpDto) {
    return await this.authService.sendOtp(sendOtpDto); 
  }

  @Get('resend-otp')
  @HttpCode(200)
  async resendOtp(@Query('email') email: string) {
    return await this.authService.resendOtp(email); 
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
     await this.authService.resetPassword(resetPasswordDto);
    return {message: 'rest password successfully! Try login'}
  }

  @Post('signin-step-2fa')
  @HttpCode(200)
  async signinStep2fa(@Body() signinStep2faDto: SigninStep2faDto) {
    const data = await this.authService.signinStep2fa(signinStep2faDto);
    return {message: 'signin successfully', data}
  }


}
