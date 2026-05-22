'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2 } from 'lucide-react';
import api from '@/lib/api';

export default function TeamPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrgs();
  }, []);

  const loadOrgs = async () => {
    const res = await api.get('/orgs');
    setOrgs(res.data);
    if (res.data.length > 0) {
      selectOrg(res.data[0].org);
    }
  };

  const selectOrg = async (org: any) => {
    setSelectedOrg(org);
    const res = await api.get(`/orgs/${org.id}/members`);
    setMembers(res.data);
  };

  const createOrg = async () => {
    if (!newOrgName.trim()) return;
    try {
      setLoading(true);
      await api.post('/orgs', { name: newOrgName });
      setNewOrgName('');
      loadOrgs();
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !selectedOrg) return;
    try {
      setLoading(true);
      await api.post(`/orgs/${selectedOrg.id}/invite`, {
        email: inviteEmail,
        role: 'MEMBER',
      });
      setInviteEmail('');
      selectOrg(selectedOrg);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error inviting member');
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (userId: string) => {
    if (!selectedOrg) return;
    await api.delete(`/orgs/${selectedOrg.id}/members/${userId}`);
    selectOrg(selectedOrg);
  };

  const roleColors: Record<string, string> = {
    OWNER: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-blue-100 text-blue-700',
    MEMBER: 'bg-gray-100 text-gray-700',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <p className="text-gray-500 mt-1">Manage your organizations and members.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orgs list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {orgs.map((m) => (
                <button
                  key={m.org.id}
                  onClick={() => selectOrg(m.org)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedOrg?.id === m.org.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {m.org.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="New org name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="text-sm"
              />
              <Button size="sm" onClick={createOrg} disabled={loading}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Members */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {selectedOrg ? `${selectedOrg.name} — Members` : 'Select an org'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedOrg && (
              <>
                {/* Invite */}
                <div className="flex gap-2 mb-6">
                  <Input
                    placeholder="Email to invite"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    type="email"
                  />
                  <Button onClick={inviteMember} disabled={loading}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                </div>

                {/* Member list */}
                <div className="space-y-3">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm">{m.user.name}</p>
                        <p className="text-xs text-gray-500">{m.user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColors[m.role]}`}>
                          {m.role}
                        </span>
                        {m.role !== 'OWNER' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(m.user.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}