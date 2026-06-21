import Link from 'next/link';

async function getData() {
  try {
    const baseUrl = process.env.INTERNAL_API_URL || 'http://backend:4000/api';
    const res = await fetch(`${baseUrl}/services`, { cache: 'no-store' });

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return [];
  }
}

export default async function Home() {
  const services = await getData();

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-3xl font-bold">Book trusted local services</h1>
        <p className="mt-2 text-slate-600">
          Browse verified vendors, book a service, and complete sandbox checkout.
        </p>
        <Link className="btn mt-4" href="/services">
          Browse Services
        </Link>
      </section>

      <h2 className="text-xl font-semibold">Featured Services</h2>

      <div className="grid grid-cols-3 gap-4">
        {services.slice(0, 6).map((s: any) => (
          <div className="card" key={s.id}>
            <h3 className="font-semibold">{s.title}</h3>
            <p className="text-sm text-slate-600">{s.category?.name}</p>
            <p className="font-bold">BDT {s.price}</p>
            <Link className="btn mt-3" href={`/services/${s.id}`}>
              Book Now
            </Link>
          </div>
        ))}
      </div>

      {services.length === 0 && <p className="card">No services found.</p>}
    </div>
  );
}