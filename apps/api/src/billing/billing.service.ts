import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

type StripeEvent = {
  type: string;
  data: { object: any };
};

@Injectable()
export class BillingService {
  private stripe: InstanceType<typeof Stripe>;

  // Plan price IDs — create these in Stripe dashboard
  private readonly plans = {
    pro: {
      name: 'Pro',
      priceId: 'price_pro_monthly', // replace with real Stripe price ID
      amount: 2900, // $29/mo
    },
    enterprise: {
      name: 'Enterprise',
      priceId: 'price_enterprise_monthly', // replace with real Stripe price ID
      amount: 9900, // $99/mo
    },
  };

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY') as string);
  }

  // ─── Create Checkout Session ───────────────────────────────────────────────
  async createCheckoutSession(userId: string, plan: 'pro' | 'enterprise') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    // Get or create Stripe customer
    let customerId = await this.getStripeCustomerId(userId);
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user!.email,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: this.plans[plan].priceId,
          quantity: 1,
        },
      ],
      success_url: `${this.config.get('FRONTEND_URL')}/billing?success=true`,
      cancel_url: `${this.config.get('FRONTEND_URL')}/billing?cancelled=true`,
      metadata: { userId, plan },
    });

    return { url: session.url };
  }

  // ─── Handle Stripe Webhooks ────────────────────────────────────────────────
  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: StripeEvent;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.config.get('STRIPE_WEBHOOK_SECRET') as string,
      );
    } catch {
      throw new Error('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCancelled(event.data.object);
        break;
    }

    return { received: true };
  }

  // ─── Customer Portal ───────────────────────────────────────────────────────
  async createPortalSession(userId: string) {
    const customerId = await this.getStripeCustomerId(userId);

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId!,
      return_url: `${this.config.get('FRONTEND_URL')}/billing`,
    });

    return { url: session.url };
  }

  // ─── Get Current Subscription ──────────────────────────────────────────────
  async getSubscription(userId: string): Promise<Record<string, any>> {
    const customerId = await this.getStripeCustomerId(userId);
    if (!customerId) return { plan: 'free', status: 'active' };

    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (!subscriptions.data.length) return { plan: 'free', status: 'active' };

    const sub = subscriptions.data[0];
    return {
      plan: sub.metadata.plan || 'pro',
      status: sub.status,
      currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
    };
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────
  private async getStripeCustomerId(userId: string): Promise<string | null> {
    const customers = await this.stripe.customers.search({
      query: `metadata['userId']:'${userId}'`,
    });
    return customers.data[0]?.id || null;
  }

  private async handleCheckoutCompleted(session: any) {
    const { userId, plan } = session.metadata!;
    console.log(`✅ Payment completed for user ${userId} — plan: ${plan}`);
    // Here you would update user's plan in DB
    // We'll add the Subscription model in the org PR
  }

  private async handleSubscriptionCancelled(sub: any) {
    const customer = await this.stripe.customers.retrieve(
      sub.customer as string,
    );
    const userId = (customer as any).metadata?.userId;
    console.log(`❌ Subscription cancelled for user ${userId}`);
  }
}
