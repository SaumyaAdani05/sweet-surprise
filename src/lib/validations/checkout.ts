import { z } from 'zod';

export const checkoutSchema = z.object({
  name: z.string()
    .min(2, { message: 'Full name must be at least 2 characters long' })
    .max(100, { message: 'Name cannot exceed 100 characters' }),
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, { message: 'Please enter a valid 10-digit mobile number' }),
  address: z.string()
    .min(10, { message: 'Please enter a detailed delivery address (minimum 10 characters)' })
    .max(1000, { message: 'Address is too long' }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
