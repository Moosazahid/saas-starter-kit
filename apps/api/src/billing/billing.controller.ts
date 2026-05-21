import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CurrentUser, Public } from '../auth/decorators/auth.decorators';

import { Request } from 'express';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  // ─── POST /billing/checkout ────────────────────────────────────────────────
  @Post('checkout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiResponse({ status: 201, description: 'Returns checkout URL' })
  createCheckout(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.billingService.createCheckoutSession(userId, dto.plan);
  }

  // ─── POST /billing/webhook ─────────────────────────────────────────────────
  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook handler' })
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.billingService.handleWebhook(req.rawBody as Buffer, signature);
  }

  // ─── GET /billing/portal ───────────────────────────────────────────────────
  @Get('portal')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe customer portal session' })
  @ApiResponse({ status: 200, description: 'Returns portal URL' })
  createPortal(@CurrentUser('id') userId: string) {
    return this.billingService.createPortalSession(userId);
  }

  // ─── GET /billing/subscription ─────────────────────────────────────────────
  @Get('subscription')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current subscription status' })
  @ApiResponse({ status: 200, description: 'Returns current plan and status' })
  getSubscription(@CurrentUser('id') userId: string) {
    return this.billingService.getSubscription(userId);
  }
}
