import { z } from 'zod';

export const productSchema = z.object({
  name: z.string()
    .min(2, { message: 'Product name must be at least 2 characters long' })
    .max(100, { message: 'Product name cannot exceed 100 characters' }),
  description: z.string()
    .min(5, { message: 'Description must be at least 5 characters long' })
    .max(1000, { message: 'Description cannot exceed 1000 characters' }),
  price: z.string()
    .refine((val) => {
      const num = parseInt(val.replace(/[^0-9]/g, ''));
      return !isNaN(num) && num > 0;
    }, { message: 'Price must be a positive number' }),
  category: z.string()
    .min(1, { message: 'Please select a category' }),
  imageUrl: z.string().optional(),
});

export const customWeightSchema = z.object({
  value: z.number({ invalid_type_error: 'Weight must be a number' })
    .positive({ message: 'Weight must be positive' }),
  unit: z.enum(['g', 'kg']),
}).superRefine((data, ctx) => {
  if (data.unit === 'g') {
    if (data.value < 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: 'Custom weight must be at least 100g',
      });
    }
    if (data.value > 10000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: 'Custom weight cannot exceed 10,000g (10kg)',
      });
    }
  } else if (data.unit === 'kg') {
    if (data.value < 0.1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: 'Custom weight must be at least 0.1kg (100g)',
      });
    }
    if (data.value > 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: 'Custom weight cannot exceed 10kg',
      });
    }
  }
});

export type ProductInput = z.infer<typeof productSchema>;
export type CustomWeightInput = z.infer<typeof customWeightSchema>;
