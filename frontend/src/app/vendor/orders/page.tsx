'use client';

import { useEffect, useState } from 'react';
import { api, statusClass } from '@/lib/api';
import { RequireRole } from '@/components/RequireRole';

function VendorOrdersContent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      setOrders(await api('/vendor/orders'));
    } catch (e: any) {
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function patch(id: string, status: string) {
    try {
      await api(`/vendor/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to update order');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Received Jobs</h1>

      {loading && <p className="card">Loading incoming orders...</p>}
      {error && <p className="card text-red-600">{error}</p>}
      {!loading && orders.length === 0 && <p className="card">No incoming orders.</p>}

      {orders.map((order) => (
        <div className="card space-y-2" key={order.id}>
          <b>{order.service.title}</b>{' '}
          <span className={`badge ${statusClass(order.status)}`}>{order.status}</span>
          <p>Customer: {order.endUser.name}</p>
          <p className="text-sm text-slate-600">BDT {order.totalAmount}</p>
          <div className="mt-2 flex gap-2">
            <button className="btn" onClick={() => patch(order.id, 'CONFIRMED')} type="button">
              Confirm
            </button>
            <button className="btn" onClick={() => patch(order.id, 'COMPLETED')} type="button">
              Complete
            </button>
            <button className="btn" onClick={() => patch(order.id, 'CANCELLED')} type="button">
              Cancel
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VendorOrders() {
  return (
    <RequireRole roles={['VENDOR']}>
      <VendorOrdersContent />
    </RequireRole>
  );
}
