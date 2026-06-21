import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole(Role.ADMIN));

adminRouter.get(
  '/users',
  asyncHandler(async (_req, res) => {
    res.json(
      await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          vendorProfile: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }),
);

adminRouter.get(
  '/vendors',
  asyncHandler(async (_req, res) => {
    res.json(
      await prisma.vendorProfile.findMany({
        include: {
          user: { select: { name: true, email: true } },
          services: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }),
);

adminRouter.patch(
  '/vendors/:id',
  asyncHandler(async (req, res) => {
    const { verified, suspended } = req.body as { verified?: boolean; suspended?: boolean };

    const vendor = await prisma.vendorProfile.update({
      where: { id: req.params.id },
      data: { verified, suspended },
    });

    res.json(vendor);
  }),
);

adminRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [users, vendors, services, orders, byStatus] = await Promise.all([
      prisma.user.count(),
      prisma.vendorProfile.count(),
      prisma.service.count(),
      prisma.order.count(),
      prisma.order.groupBy({ by: ['status'], _count: true }),
    ]);

    res.json({ users, vendors, services, orders, byStatus });
  }),
);
