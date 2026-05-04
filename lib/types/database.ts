export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          auth_user_id: string
          role: string
          partner_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      partners: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          type: string
          active: boolean
          internal_rating: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['partners']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['partners']['Insert']>
      }
      boats: {
        Row: {
          id: string
          slug: string
          name: string
          tagline: string | null
          description: string | null
          partner_id: string | null
          capacity_max: number
          capacity_min: number
          departure_time: string
          duration_hours: number
          price_adult: number
          price_child: number
          child_free_until_age: number
          child_half_until_age: number
          features: string[]
          itinerary: Json
          cover_image: string | null
          active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['boats']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['boats']['Insert']>
      }
      services: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          price_label: string | null
          cover_image: string | null
          partner_id: string | null
          active: boolean
          display_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }
      gallery: {
        Row: {
          id: string
          boat_id: string | null
          service_id: string | null
          url: string
          alt_text: string | null
          display_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['gallery']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['gallery']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          booking_id: string | null
          partner_id: string | null
          boat_id: string | null
          rating: number
          comment: string | null
          public: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      testimonials: {
        Row: {
          id: string
          author_name: string
          author_city: string | null
          content: string
          rating: number | null
          approved: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['testimonials']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['testimonials']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          boat_id: string | null
          tour_date: string
          adults: number
          children: number
          total_cents: number
          customer_name: string | null
          customer_phone: string | null
          customer_email: string | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      contacts: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          message: string
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['contacts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['contacts']['Insert']>
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Partner = Database['public']['Tables']['partners']['Row']
export type Boat = Database['public']['Tables']['boats']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Gallery = Database['public']['Tables']['gallery']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']
export type ItineraryStop = { stop: string; minutes: number }
