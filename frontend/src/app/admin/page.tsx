'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { RequireRole } from '@/components/RequireRole';

function AdminStats() {
  const [stats, setStats] = useState<any>();
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/stats').then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="card text-red-600">{error}</p>;
  if (!stats) return <p className="card">Loading admin stats...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Platform Stats</h1>
      <div className="grid gap-4 md:grid-cols-4">
        {['users', 'vendors', 'services', 'orders'].map((key) => (
          <div className="card" key={key}>
            <b className="text-2xl">{stats[key]}</b>
            <p className="capitalize">{key}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireRole roles={['ADMIN']}>
      <AdminStats />
    </RequireRole>
  );
}
