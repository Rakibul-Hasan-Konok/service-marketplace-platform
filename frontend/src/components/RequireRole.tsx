'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, type User } from '@/store/auth';

type Role = User['role'];

export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, hydrate } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  useEffect(() => {
    if (ready && !user) router.push('/login');
  }, [ready, user, router]);

  if (!ready) return <p className="card">Checking access...</p>;

  if (!user) {
    return (
      <div className="card space-y-3">
        <h1 className="text-xl font-bold">Login required</h1>
        <p>Please login to continue.</p>
        <Link className="btn" href="/login">
          Login
        </Link>
      </div>
    );
  }

  if (!roles.includes(user.role)) {
    return (
      <div className="card text-red-600">
        403 Forbidden: this page is not available for your role.
      </div>
    );
  }

  return <>{children}</>;
}
