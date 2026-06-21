import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['VENDOR', 'END_USER']),
  businessName: z.string().min(2).optional(),
  description: z.string().min(5).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const serviceSchema = z.object({
  title: z.string().min(3),

  // FIXED HERE
  description: z.string().min(1),

  categoryId: z.string().min(1),
  price: z.coerce.number().positive(),
  isActive: z.boolean().optional()
});

export const bookingSchema = z.object({
  serviceId: z.string().min(1),
  scheduledDate: z.coerce.date(),
  forceFail: z.boolean().optional()
});

export const orderStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'COMPLETED', 'CANCELLED'])
});