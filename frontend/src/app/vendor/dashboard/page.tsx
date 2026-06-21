'use client';

import { useEffect, useState } from 'react';
import { api, statusClass } from '@/lib/api';
import { RequireRole } from '@/components/RequireRole';

function VendorDashboardContent() {
  const [data, setData] = useState<any>();
  const [error, setError] = useState('');

  useEffect(() => {
    api('/vendor/dashboard').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="card text-red-600">{error}</p>;
  if (!data) return <p className="card">Loading vendor dashboard...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <b className="text-2xl">{data.services.length}</b>
          <p>Services</p>
        </div>
        <div className="card">
          <b className="text-2xl">{data.orders.length}</b>
          <p>Incoming Orders</p>
        </div>
      </div>

      {data.orders.slice(0, 5).map((order: any) => (
        <div className="card" key={order.id}>
          {order.service.title}{' '}
          <span className={`badge ${statusClass(order.status)}`}>{order.status}</span>
        </div>
      ))}
    </div>
  );
}

export default function VendorDashboard() {
  return (
    <RequireRole roles={['VENDOR']}>
      <VendorDashboardContent />
    </RequireRole>
  );
}
