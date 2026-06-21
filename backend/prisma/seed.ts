import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const password = 'Test@12345';

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({ data: { name: 'Admin User', email: 'admin@test.com', passwordHash, role: Role.ADMIN } });
  await prisma.user.createMany({ data: [
    { name: 'End User One', email: 'user1@test.com', passwordHash, role: Role.END_USER },
    { name: 'End User Two', email: 'user2@test.com', passwordHash, role: Role.END_USER }
  ]});

  const vendors = await Promise.all([
    prisma.user.create({ data: { name: 'Rahim Services', email: 'vendor1@test.com', passwordHash, role: Role.VENDOR, vendorProfile: { create: { businessName: 'Rahim Home Care', description: 'Reliable home cleaning and plumbing team.', verified: true } } }, include: { vendorProfile: true } }),
    prisma.user.create({ data: { name: 'Nadia Repairs', email: 'vendor2@test.com', passwordHash, role: Role.VENDOR, vendorProfile: { create: { businessName: 'Nadia Repair Hub', description: 'AC, electrical and appliance repair specialists.', verified: true } } }, include: { vendorProfile: true } }),
    prisma.user.create({ data: { name: 'Bright Skills', email: 'vendor3@test.com', passwordHash, role: Role.VENDOR, vendorProfile: { create: { businessName: 'Bright Skills & Beauty', description: 'Tutoring and at-home beauty professionals.', verified: false } } }, include: { vendorProfile: true } })
  ]);

  const categoryNames = ['Home Cleaning', 'AC Repair', 'Plumbing', 'Electrical', 'Tutoring', 'Beauty', 'Appliance Repair', 'Pest Control'];
  const categories = Object.fromEntries(await Promise.all(categoryNames.map(async (name) => [name, await prisma.category.create({ data: { name } })])));

  const svc = async (vendorIndex: number, category: string, title: string, price: number) => prisma.service.create({ data: {
    vendorProfileId: vendors[vendorIndex].vendorProfile!.id,
    categoryId: categories[category].id,
    title,
    description: `${title} with trained professionals, transparent pricing and scheduled arrival.`,
    price
  }});

  await Promise.all([
    svc(0, 'Home Cleaning', 'Deep Home Cleaning', 2500), svc(0, 'Home Cleaning', 'Kitchen Cleaning', 1200), svc(0, 'Plumbing', 'Leakage Repair', 900), svc(0, 'Pest Control', 'Cockroach Control', 1800),
    svc(1, 'AC Repair', 'AC Servicing', 1500), svc(1, 'AC Repair', 'AC Gas Refill', 3200), svc(1, 'Electrical', 'Fan Installation', 700), svc(1, 'Appliance Repair', 'Washing Machine Repair', 2200),
    svc(2, 'Tutoring', 'Math Tutoring Class 8', 1000), svc(2, 'Tutoring', 'English Speaking Session', 800), svc(2, 'Beauty', 'Home Facial Service', 1800), svc(2, 'Beauty', 'Bridal Makeup Trial', 3500)
  ]);

  console.log('Seed completed. Password for all test accounts:', password);
}
main().finally(() => prisma.$disconnect());
