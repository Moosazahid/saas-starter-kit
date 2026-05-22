'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, Zap, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.get('/auth/me').then((res) => setUser(res.data));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{user ? `, ${user.name}` : ''}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening with your account.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Users', value: '1', icon: Users, color: 'text-blue-600' },
          { title: 'Active Plan', value: 'Free', icon: CreditCard, color: 'text-green-600' },
          { title: 'API Calls', value: '142', icon: Zap, color: 'text-purple-600' },
          { title: 'Growth', value: '+12%', icon: TrendingUp, color: 'text-orange-600' },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Role</span>
                <span className="font-medium">{user.role}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}