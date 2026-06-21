import jwt, { type SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';

const secret = process.env.JWT_SECRET || 'dev-secret';
export type JwtPayload = { userId: string; role: Role };

export function signToken(payload: JwtPayload) {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
