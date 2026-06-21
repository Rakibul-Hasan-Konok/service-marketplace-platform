import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { loginSchema, signupSchema } from '../schemas/index.js';
import { signToken } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authRouter = Router();

authRouter.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const data = signupSchema.parse(req.body);

    if (data.role === 'VENDOR' && (!data.businessName || !data.description)) {
      return res.status(400).json({ message: 'Vendor businessName and description are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role as Role,
        vendorProfile:
          data.role === 'VENDOR'
            ? {
                create: {
                  businessName: data.businessName!,
                  description: data.description!,
                  verified: false,
                },
              }
            : undefined,
      },
      include: { vendorProfile: true },
    });

    const token = signToken({ userId: user.id, role: user.role });
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorProfile: user.vendorProfile,
      },
    });
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { vendorProfile: true },
    });

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.vendorProfile?.suspended) {
      return res.status(403).json({ message: 'Vendor account is suspended' });
    }

    const token = signToken({ userId: user.id, role: user.role });
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorProfile: user.vendorProfile,
      },
    });
  }),
);

authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { vendorProfile: true },
    });

    if (!user) return res.status(401).json({ message: 'User no longer exists' });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorProfile: user.vendorProfile,
    });
  }),
);
