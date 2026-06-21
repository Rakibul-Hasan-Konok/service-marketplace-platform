'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { RequireRole } from '@/components/RequireRole';

function AdminVendorList() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      setVendors(await api('/admin/vendors'));
    } catch (e: any) {
      setError(e.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleVendor(id: string, patch: { verified?: boolean; suspended?: boolean }) {
    try {
      await api(`/admin/vendors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to update vendor');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Verify/Suspend Vendors</h1>

      {loading && <p className="card">Loading vendors...</p>}
      {error && <p className="card text-red-600">{error}</p>}
      {!loading && vendors.length === 0 && <p className="card">No vendors found.</p>}

      {vendors.map((vendor) => (
        <div className="card space-y-2" key={vendor.id}>
          <b>{vendor.businessName}</b>
          <p>{vendor.user.email}</p>
          <p>Services: {vendor.services?.length || 0}</p>
          <p>
            Verified: {String(vendor.verified)} | Suspended: {String(vendor.suspended)}
          </p>
          <div className="flex gap-2">
            <button
              className="btn"
              onClick={() => toggleVendor(vendor.id, { verified: !vendor.verified })}
              type="button"
            >
              Toggle Verify
            </button>
            <button
              className="btn"
              onClick={() => toggleVendor(vendor.id, { suspended: !vendor.suspended })}
              type="button"
            >
              Toggle Suspend
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminVendors() {
  return (
    <RequireRole roles={['ADMIN']}>
      <AdminVendorList />
    </RequireRole>
  );
}
