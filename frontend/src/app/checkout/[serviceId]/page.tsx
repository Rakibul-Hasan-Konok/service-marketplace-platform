'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { RequireRole } from '@/components/RequireRole';

function CheckoutForm({ serviceId }: { serviceId: string }) {
  const [date, setDate] = useState('');
  const [msg, setMsg] = useState('');
  const [fail, setFail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  async function pay() {
    if (!date) {
      setMsg('Please select schedule date and time.');
      return;
    }

    setLoading(true);
    setMsg('');
    setOrderId(null);

    try {
      const data = await api('/user/checkout', {
        method: 'POST',
        body: JSON.stringify({
          serviceId,
          scheduledDate: date,
          forceFail: fail,
        }),
      });

      setOrderId(data.order.id);
      setMsg('Payment success. Order CONFIRMED.');
    } catch (e: any) {
      setMsg(`Payment failed/not confirmed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card max-w-lg space-y-3">
      <h1 className="text-xl font-bold">Checkout</h1>
      <p className="text-sm text-slate-600">
        Select your preferred schedule and complete the sandbox payment.
      </p>

      <input
        className="input"
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <label className="flex gap-2 text-sm">
        <input
          type="checkbox"
          checked={fail}
          onChange={(e) => setFail(e.target.checked)}
        />
        Simulate failed payment
      </label>

      <button className="btn" onClick={pay} disabled={loading} type="button">
        {loading ? 'Processing sandbox payment...' : 'Pay with Mock Gateway'}
      </button>

      {msg && <p className={msg.includes('success') ? 'text-green-700' : 'text-red-600'}>{msg}</p>}

      {orderId && (
        <Link className="btn bg-green-700 hover:bg-green-800" href="/dashboard">
          View My Orders
        </Link>
      )}
    </div>
  );
}

export default function CheckoutPage({
  params,
}: {
  params: { serviceId: string };
}) {
  return (
    <RequireRole roles={['END_USER']}>
      <CheckoutForm serviceId={params.serviceId} />
    </RequireRole>
  );
}
