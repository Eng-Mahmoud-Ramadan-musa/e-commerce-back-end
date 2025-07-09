import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { UserRepository } from 'src/DB';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository
  ) {};

  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async sign(payload: object, options?: JwtSignOptions) {
    return this.jwtService.signAsync(payload, options)
  }

  async verify(payload: string, options?: JwtVerifyOptions) {
    return this.jwtService.verifyAsync(payload, options)
  }

  async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) throw new UnauthorizedException('Invalid Google token');

      return {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub,
        email_verified: payload.email_verified,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async verifyTokenAuth(authorization: string) {
    if (!authorization || !authorization.startsWith(process.env.BEARER_KEY as string)) {
      throw new UnauthorizedException('Invalid or missing authorization header');
    }

    const token = authorization.split(' ')[1];

    let data: any;
    try {
      data = await this.verify(token,
      { secret: process.env.JWT_SECRET}
    )
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    
    if (!data?.userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.userRepository.findById({ id: data.userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

}
