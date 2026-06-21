import Link from 'next/link';

async function getService(id: string) {
  const baseUrl = process.env.INTERNAL_API_URL || 'http://backend:4000/api';
  const res = await fetch(`${baseUrl}/services/${id}`, { cache: 'no-store' });

  if (!res.ok) return null;
  return res.json();
}

export default async function ServiceDetail({
  params,
}: {
  params: { id: string };
}) {
  const service = await getService(params.id);

  if (!service) {
    return <p className="card text-red-600">Service not found.</p>;
  }

  return (
    <div className="card max-w-2xl space-y-4">
      <div>
        <p className="text-sm text-slate-500">{service.category?.name}</p>
        <h1 className="text-3xl font-bold">{service.title}</h1>
      </div>

      <p className="text-slate-700">{service.description}</p>

      <div className="rounded-md bg-slate-50 p-4">
        <p>
          <span className="font-semibold">Vendor:</span>{' '}
          {service.vendorProfile?.businessName || 'Verified Vendor'}
        </p>
        <p>
          <span className="font-semibold">Price:</span> BDT {service.price}
        </p>
      </div>

      <Link className="btn" href={`/checkout/${service.id}`}>
        Book Now
      </Link>
    </div>
  );
}
