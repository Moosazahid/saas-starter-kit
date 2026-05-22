    'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import api from '@/lib/api';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: ['1 organization', '3 team members', '1,000 API calls/mo'],
    current: true,
    plan: null,
  },
  {
    name: 'Pro',
    price: '$29',
    description: 'For growing teams',
    features: ['5 organizations', '25 team members', '50,000 API calls/mo', 'Priority support'],
    current: false,
    plan: 'pro',
  },
  {
    name: 'Enterprise',
    price: '$99',
    description: 'For large organizations',
    features: ['Unlimited organizations', 'Unlimited members', 'Unlimited API calls', '24/7 support'],
    current: false,
    plan: 'enterprise',
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: string) => {
    try {
      setLoading(plan);
      const res = await api.post('/billing/checkout', { plan });
      window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and billing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.current ? 'border-blue-500 border-2' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.current && <Badge>Current Plan</Badge>}
              </div>
              <div className="text-3xl font-bold">
                {plan.price}
                <span className="text-sm font-normal text-gray-500">/mo</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.plan ? (
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(plan.plan!)}
                  disabled={loading === plan.plan}
                >
                  {loading === plan.plan ? 'Redirecting...' : `Upgrade to ${plan.name}`}
                </Button>
              ) : (
                <Button className="w-full" variant="outline" disabled>
                  Current Plan
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}