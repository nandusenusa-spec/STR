export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string | null
  stock: number
  is_active: boolean
  created_at: string
}

export interface Trip {
  id: string
  title: string
  description: string | null
  destination: string
  start_date: string
  end_date: string
  price: number
  max_participants: number
  current_participants: number
  image_url: string | null
  is_active: boolean
  created_at: string
}

export interface TripRegistration {
  id: string
  trip_id: string
  full_name: string
  email: string
  phone: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

export interface TrainingSchedule {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  discipline: 'surf' | 'skate' | 'sup'
  location: string
  location_lat: number | null
  location_lng: number | null
  instructor: string | null
  is_active: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  payment_id: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  /** DB column `price` on public.order_items */
  price: number
}

// Community Platform Types
export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  discipline: 'surf' | 'skate' | 'sup' | null
  level: 'beginner' | 'intermediate' | 'advanced' | null
  followers_count: number
  following_count: number
  created_at: string
}

export interface ChatChannel {
  id: string
  name: string
  description: string | null
  discipline: 'surf' | 'skate' | 'sup' | 'general'
  is_private: boolean
  created_at: string
}

export interface ChatMessage {
  id: string
  channel_id: string
  user_id: string
  content: string
  attachments: string[] | null
  created_at: string
  updated_at: string
  user: UserProfile | null
}

export interface ForumPost {
  id: string
  category_id: string
  user_id: string
  title: string
  content: string
  views_count: number
  replies_count: number
  created_at: string
  updated_at: string
  user: UserProfile | null
}

export interface Event {
  id: string
  title: string
  description: string | null
  type: 'clase' | 'viaje' | 'meetup'
  discipline: 'surf' | 'skate' | 'sup'
  start_date: string
  end_date: string
  location: string | null
  max_participants: number | null
  current_participants: number
  image_url: string | null
  created_at: string
}

export interface SocialPost {
  id: string
  user_id: string
  post_type: 'image' | 'video' | 'story' | 'reel'
  caption: string | null
  media_url: string
  thumbnail_url: string | null
  duration_seconds: number | null
  is_featured: boolean
  likes_count: number
  comments_count: number
  views_count: number
  created_at: string
  user: UserProfile | null
  liked_by_me: boolean
}

/** Fase 2 — espacio por entrenador (`public.spaces`) */
export interface Space {
  id: string
  slug: string
  name: string
  description: string | null
  owner_id: string
  is_public: boolean
  /** Fase 3: invitación por código/link */
  invite_code?: string | null
  invite_enabled?: boolean
  created_at: string
  updated_at: string
}

export type SpaceMemberRole = 'owner' | 'instructor' | 'student'
