import './globals.css';
import { Nav } from '@/components/Nav';

export const metadata = {
  title: 'Service Marketplace',
  description: 'Multi-vendor local service marketplace with role-based access control',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="mx-auto max-w-6xl px-4 pb-10">{children}</main>
      </body>
    </html>
  );
}
