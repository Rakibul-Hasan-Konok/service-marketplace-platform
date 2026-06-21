'use client';

import { useEffect, useState } from 'react';
import { api, statusClass } from '@/lib/api';
import { RequireRole } from '@/components/RequireRole';

function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/user/orders')
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Orders</h1>
      {loading && <p className="card">Loading orders...</p>}
      {error && <p className="card text-red-600">{error}</p>}
      {!loading && orders.length === 0 && <p className="card">No orders found.</p>}
      {orders.map((o) => (
        <div className="card space-y-2" key={o.id}>
          <h3 className="font-bold">{o.service?.title}</h3>
          <span className={`badge ${statusClass(o.status)}`}>{o.status}</span>
          <p>BDT {o.totalAmount}</p>
          <p>{new Date(o.scheduledDate).toLocaleString()}</p>
          <p className="text-sm text-slate-600">Payment: {o.transaction?.status || 'N/A'}</p>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  return (
    <RequireRole roles={['END_USER']}>
      <Orders />
    </RequireRole>
  );
}
