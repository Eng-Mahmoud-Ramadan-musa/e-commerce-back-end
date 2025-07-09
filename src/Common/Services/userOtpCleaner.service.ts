// src/Common/user-otp-cleaner.service.ts
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRepository } from 'src/DB';

@Injectable()
export class UserOtpCleanerService {
  private readonly logger = new Logger(UserOtpCleanerService.name);

  constructor(@Inject(forwardRef(() => UserRepository)) private readonly userRepository: UserRepository) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    const now = new Date();
    const result = await this.userRepository.updateMany(
      {
        'OTP.expiresIn': { $lt: now },
      },
      {
        $unset: { OTP: '' },
      },
    );

    if (result.modifiedCount > 0) {
      this.logger.log(`Deleted ${result.modifiedCount} expired OTPs`);
    }
  }
}
