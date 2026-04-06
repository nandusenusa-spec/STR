import { z } from 'zod'

const subscriptionTypes = z.enum([
  'classes',
  'trip',
  'newsletter',
  'trip_nicaragua',
  'trip_peru',
])

export const subscribeBodySchema = z.object({
  instagram_username: z
    .string()
    .min(1)
    .max(64)
    .transform((s) => s.replace(/^@/, '').trim().toLowerCase()),
  whatsapp_phone: z.string().min(6).max(32),
  subscription_type: subscriptionTypes.optional().default('newsletter'),
})

const uuidLike = z.string().uuid()

export const checkoutItemSchema = z.object({
  product_id: uuidLike,
  name: z.string().min(1).max(240),
  price: z.number().finite(),
  quantity: z.number().int().min(1).max(99),
})

export const checkoutBodySchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(40),
  customer: z.object({
    name: z.string().min(1).max(200),
    email: z.string().email().max(254),
    phone: z.string().max(40).optional(),
  }),
  total: z.number().finite().nonnegative(),
})
