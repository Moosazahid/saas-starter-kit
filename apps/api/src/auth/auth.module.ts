import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy, JwtRefreshStrategy, LocalAuthStrategy } from './strategies/auth.strategies';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({}), // secrets are passed per-signAsync call
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    LocalAuthStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}