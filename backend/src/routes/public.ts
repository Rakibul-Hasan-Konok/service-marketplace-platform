import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const publicRouter = Router();

publicRouter.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    res.json(await prisma.category.findMany({ orderBy: { name: 'asc' } }));
  }),
);

publicRouter.get(
  '/services',
  asyncHandler(async (req, res) => {
    const { q, categoryId, minPrice, maxPrice, sort = 'asc' } = req.query as Record<string, string>;

    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        vendorProfile: { verified: true, suspended: false },
        categoryId: categoryId || undefined,
        price: {
          gte: minPrice ? Number(minPrice) : undefined,
          lte: maxPrice ? Number(maxPrice) : undefined,
        },
        OR: q
          ? [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: {
        category: true,
        vendorProfile: { include: { user: { select: { name: true } } } },
      },
      orderBy: { price: sort === 'desc' ? 'desc' : 'asc' },
    });

    res.json(services);
  }),
);

publicRouter.get(
  '/services/:id',
  asyncHandler(async (req, res) => {
    const service = await prisma.service.findFirst({
      where: {
        id: req.params.id,
        isActive: true,
        vendorProfile: { verified: true, suspended: false },
      },
      include: { category: true, vendorProfile: true },
    });

    if (!service) return res.status(404).json({ message: 'Service not found' });
    return res.json(service);
  }),
);
