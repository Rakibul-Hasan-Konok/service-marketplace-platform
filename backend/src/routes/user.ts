import { Router } from 'express';
import { Role, OrderStatus, TransactionStatus } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { bookingSchema } from '../schemas/index.js';
import { createMockPaymentIntent } from '../lib/payments/mockGateway.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const userRouter = Router();

userRouter.use(authenticate, requireRole(Role.END_USER));

userRouter.get(
  '/profile',
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json(user);
  }),
);

userRouter.get(
  '/orders',
  asyncHandler(async (req, res) => {
    res.json(
      await prisma.order.findMany({
        where: { endUserId: req.user!.userId },
        include: {
          service: { include: { category: true, vendorProfile: true } },
          transaction: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }),
);

userRouter.post(
  '/bookings',
  asyncHandler(async (req, res) => {
    const data = bookingSchema.parse(req.body);
    const service = await prisma.service.findFirst({
      where: { id: data.serviceId, isActive: true, vendorProfile: { verified: true, suspended: false } },
    });

    if (!service) return res.status(404).json({ message: 'Service unavailable' });

    const order = await prisma.order.create({
      data: {
        endUserId: req.user!.userId,
        serviceId: service.id,
        scheduledDate: data.scheduledDate,
        totalAmount: service.price,
        status: OrderStatus.PENDING,
      },
    });

    return res.status(201).json(order);
  }),
);

userRouter.post(
  '/checkout',
  asyncHandler(async (req, res) => {
    const data = bookingSchema.parse(req.body);
    const service = await prisma.service.findFirst({
      where: { id: data.serviceId, isActive: true, vendorProfile: { verified: true, suspended: false } },
    });

    if (!service) return res.status(404).json({ message: 'Service unavailable' });

    const result = await createMockPaymentIntent(Number(service.price), data.forceFail);
    const order = await prisma.order.create({
      data: {
        endUserId: req.user!.userId,
        serviceId: service.id,
        scheduledDate: data.scheduledDate,
        totalAmount: service.price,
        status: result.success ? OrderStatus.CONFIRMED : OrderStatus.PENDING,
        transaction: {
          create: {
            paymentReference: result.reference,
            status: result.success ? TransactionStatus.SUCCESS : TransactionStatus.FAILED,
            gatewayResponse: result.response,
          },
        },
      },
      include: { transaction: true, service: true },
    });

    return res.status(result.success ? 201 : 402).json({ order, payment: result });
  }),
);
