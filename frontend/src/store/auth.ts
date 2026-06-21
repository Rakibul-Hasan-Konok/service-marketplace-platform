import { create } from 'zustand';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'VENDOR' | 'END_USER';
  vendorProfile?: unknown;
};

type AuthState = {
  user: User | null;
  token: string | null;
  hydrate: () => void;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,

  hydrate: () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    let user: User | null = null;
    try {
      user = userRaw ? (JSON.parse(userRaw) as User) : null;
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }

    set({ token, user });
  },

  setAuth: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ token, user });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ token: null, user: null });
  },
}));

// Compatibility export. Some components may import either name.
export const useAuthStore = useAuth;
