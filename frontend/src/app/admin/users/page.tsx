'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { RequireRole } from '@/components/RequireRole';

function AdminUsersList() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/users').then(setUsers).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      {error && <p className="card text-red-600">{error}</p>}
      {users.map((user) => (
        <div className="card" key={user.id}>
          <b>{user.name}</b>
          <p>{user.email}</p>
          <p>{user.role}</p>
        </div>
      ))}
    </div>
  );
}

export default function AdminUsers() {
  return (
    <RequireRole roles={['ADMIN']}>
      <AdminUsersList />
    </RequireRole>
  );
}
