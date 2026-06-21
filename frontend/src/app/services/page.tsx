'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function Services() {
  const [items, setItems] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    try {
      const query = new URLSearchParams();
      if (q.trim()) query.set('q', q.trim());
      if (categoryId) query.set('categoryId', categoryId);

      const [services, categories] = await Promise.all([
        api(`/services?${query.toString()}`),
        api('/categories'),
      ]);

      setItems(services);
      setCats(categories);
    } catch (e: any) {
      setError(e.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Services</h1>

      <div className="card flex flex-col gap-2 md:flex-row">
        <input
          className="input"
          placeholder="Search services, e.g. AC"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">All categories</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="btn" onClick={load} type="button">
          Search
        </button>
      </div>

      {loading && <p className="card">Loading services...</p>}
      {error && <p className="card text-red-600">{error}</p>}
      {!loading && items.length === 0 && <p className="card">No services found.</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((s) => (
          <div className="card space-y-2" key={s.id}>
            <h3 className="font-bold">{s.title}</h3>
            <p className="text-sm text-slate-600">{s.category?.name}</p>
            <p className="text-sm">Vendor: {s.vendorProfile?.businessName}</p>
            <p className="font-semibold">BDT {s.price}</p>
            <Link className="btn mt-2" href={`/services/${s.id}`}>
              Book Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
