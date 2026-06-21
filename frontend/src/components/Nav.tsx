'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/store/auth';

export function Nav() {
  const { user, hydrate, logout } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const roleClass =
    user?.role === 'ADMIN'
      ? 'border-purple-500'
      : user?.role === 'VENDOR'
        ? 'border-orange-500'
        : user?.role === 'END_USER'
          ? 'border-green-500'
          : 'border-slate-300';

  return (
    <nav className={`mb-6 border-b-4 ${roleClass} bg-white p-4`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="font-bold">
          Service Marketplace
        </Link>

        <div className="flex gap-4 text-sm">
          <Link href="/services">Services</Link>

          {user?.role === 'END_USER' && <Link href="/dashboard">My Orders</Link>}

          {user?.role === 'VENDOR' && (
            <>
              <Link href="/vendor/dashboard">Vendor Dashboard</Link>
              <Link href="/vendor/services">Manage Services</Link>
              <Link href="/vendor/orders">Orders</Link>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <>
              <Link href="/admin">Admin Stats</Link>
              <Link href="/admin/vendors">Vendors</Link>
              <Link href="/admin/users">Users</Link>
            </>
          )}

          {user ? (
            <button type="button" onClick={logout} className="font-medium text-red-600">
              Logout
            </button>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup">Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
