import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard } from './auth/guards/auth.guards';
import { BillingModule } from './billing/billing.module';
import { OrgsModule } from './orgs/orgs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    BillingModule,
    OrgsModule
  ],
  providers: [
    {
      // JwtAuthGuard is now global — every route is protected by default
      // Use @Public() on any route you want to be open
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
