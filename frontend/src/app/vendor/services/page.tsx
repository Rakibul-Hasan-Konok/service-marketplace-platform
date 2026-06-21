'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { RequireRole } from '@/components/RequireRole';

function VendorServicesContent() {
  const [items, setItems] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setError('');
      const [services, categories] = await Promise.all([
        api('/vendor/services'),
        api('/categories'),
      ]);
      setItems(services);
      setCats(categories);
    } catch (e: any) {
      setError(e.message || 'Failed to load vendor services');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!form.title || !form.price || !form.categoryId || !form.description) {
      setError('Title, price, category, and description are required.');
      return;
    }

    try {
      setError('');
      await api('/vendor/services', {
        method: 'POST',
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      setForm({});
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to create service');
    }
  }

  async function deactivate(id: string) {
    try {
      await api(`/vendor/services/${id}`, { method: 'DELETE' });
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to deactivate service');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Manage Services</h1>

      {error && <p className="card text-red-600">{error}</p>}

      <div className="card grid gap-2 md:grid-cols-2">
        <input
          className="input"
          placeholder="Title"
          value={form.title || ''}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className="input"
          placeholder="Price"
          type="number"
          value={form.price || ''}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <select
          className="input"
          value={form.categoryId || ''}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        >
          <option value="">Select category</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <textarea
          className="input"
          placeholder="Description"
          value={form.description || ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button className="btn" onClick={create} type="button">
          Create Service
        </button>
      </div>

      {loading && <p className="card">Loading services...</p>}
      {!loading && items.length === 0 && <p className="card">No services found.</p>}

      {items.map((service) => (
        <div className="card space-y-2" key={service.id}>
          <b>{service.title}</b>
          <p>{service.category?.name}</p>
          <p>BDT {service.price}</p>
          <p>{service.isActive ? 'Active' : 'Inactive'}</p>
          {service.isActive && (
            <button className="btn" onClick={() => deactivate(service.id)} type="button">
              Deactivate
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function VendorServices() {
  return (
    <RequireRole roles={['VENDOR']}>
      <VendorServicesContent />
    </RequireRole>
  );
}
