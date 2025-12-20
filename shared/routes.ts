import { z } from 'zod';
import { insertFundSchema, funds, submitProofSchema, verifyFundSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  funds: {
    list: {
      method: 'GET' as const,
      path: '/api/funds',
      input: z.object({
        role: z.enum(['Funder', 'Beneficiary', 'Verifier']).optional(),
        address: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof funds.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/funds/:id',
      responses: {
        200: z.custom<typeof funds.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/funds',
      input: insertFundSchema,
      responses: {
        201: z.custom<typeof funds.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    submitProof: {
      method: 'PATCH' as const,
      path: '/api/funds/:id/proof',
      input: submitProofSchema,
      responses: {
        200: z.custom<typeof funds.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    verify: {
      method: 'PATCH' as const,
      path: '/api/funds/:id/verify',
      input: verifyFundSchema,
      responses: {
        200: z.custom<typeof funds.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
