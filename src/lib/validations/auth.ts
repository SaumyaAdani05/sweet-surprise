import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(30, { message: 'Username cannot exceed 30 characters' })
    .regex(/^[a-zA-Z0-9_@.]+$/, { message: 'Username can only contain letters, numbers, underscores, @, or dots' }),
  password: z.string()
    .min(3, { message: 'Password must be at least 3 characters long' }),
});

export const registerSchema = z.object({
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(30, { message: 'Username cannot exceed 30 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, or underscores' }),
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(100, { message: 'Name cannot exceed 100 characters' }),
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, { message: 'Phone number must be a valid 10-digit Indian number' }),
  address: z.string()
    .min(10, { message: 'Please enter a complete delivery address (at least 10 characters)' })
    .max(500, { message: 'Address is too long' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
