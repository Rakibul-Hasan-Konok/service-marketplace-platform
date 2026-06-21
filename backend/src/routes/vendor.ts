import { Router } from 'express';
import { OrderStatus, Role } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { orderStatusSchema, serviceSchema } from '../schemas/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const vendorRouter = Router();

vendorRouter.use(authenticate, requireRole(Role.VENDOR));

async function profileId(userId: string) {
  const profile = await prisma.vendorProfile.findUnique({ where: { userId } });
  return profile?.id;
}

vendorRouter.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const id = await profileId(req.user!.userId);
    if (!id) return res.status(404).json({ message: 'Vendor profile missing' });

    const [services, orders] = await Promise.all([
      prisma.service.findMany({ where: { vendorProfileId: id }, include: { category: true } }),
      prisma.order.findMany({
        where: { service: { vendorProfileId: id } },
        include: { service: true, endUser: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.json({ services, orders });
  }),
);

vendorRouter.get(
  '/services',
  asyncHandler(async (req, res) => {
    const id = await profileId(req.user!.userId);
    if (!id) return res.status(404).json({ message: 'Vendor profile missing' });

    res.json(
      await prisma.service.findMany({
        where: { vendorProfileId: id },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }),
);

vendorRouter.post(
  '/services',
  asyncHandler(async (req, res) => {
    const id = await profileId(req.user!.userId);
    if (!id) return res.status(404).json({ message: 'Vendor profile missing' });

    const data = serviceSchema.parse(req.body);
    const service = await prisma.service.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        isActive: data.isActive ?? true,
        vendorProfileId: id,
        categoryId: data.categoryId,
      },
      include: { category: true },
    });

    return res.status(201).json(service);
  }),
);

vendorRouter.put(
  '/services/:id',
  asyncHandler(async (req, res) => {
    const id = await profileId(req.user!.userId);
    if (!id) return res.status(404).json({ message: 'Vendor profile missing' });

    const data = serviceSchema.partial().parse(req.body);
    const service = await prisma.service.findFirst({ where: { id: req.params.id, vendorProfileId: id } });

    if (!service) return res.status(404).json({ message: 'Service not found or not owned by this vendor' });

    return res.json(await prisma.service.update({ where: { id: service.id }, data }));
  }),
);

vendorRouter.delete(
  '/services/:id',
  asyncHandler(async (req, res) => {
    const id = await profileId(req.user!.userId);
    if (!id) return res.status(404).json({ message: 'Vendor profile missing' });

    const service = await prisma.service.findFirst({ where: { id: req.params.id, vendorProfileId: id } });
    if (!service) return res.status(404).json({ message: 'Service not found or not owned by this vendor' });

    return res.json(await prisma.service.update({ where: { id: service.id }, data: { isActive: false } }));
  }),
);

vendorRouter.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const id = await profileId(req.user!.userId);
    if (!id) return res.status(404).json({ message: 'Vendor profile missing' });

    res.json(
      await prisma.order.findMany({
        where: { service: { vendorProfileId: id } },
        include: { service: true, endUser: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }),
);

vendorRouter.patch(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    const id = await profileId(req.user!.userId);
    if (!id) return res.status(404).json({ message: 'Vendor profile missing' });

    const { status } = orderStatusSchema.parse(req.body);
    const order = await prisma.order.findFirst({ where: { id: req.params.id, service: { vendorProfileId: id } } });

    if (!order) return res.status(404).json({ message: 'Order not found for this vendor' });

    if (![OrderStatus.CONFIRMED, OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(status as OrderStatus)) {
      return res.status(400).json({ message: 'Invalid transition' });
    }

    return res.json(await prisma.order.update({ where: { id: order.id }, data: { status: status as OrderStatus } }));
  }),
);
