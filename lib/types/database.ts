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
          asaas_wallet_id:  string | null
          asaas_account_id: string | null
          commission_pct:   number
          cpf_cnpj:         string | null
          birth_date:       string | null
          mobile_phone:     string | null
          address:          string | null
          address_number:   string | null
          province:         string | null
          postal_code:      string | null
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
          commission_pct: number
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
          features: string[] | null
          cover_image: string | null
          partner_id: string | null
          active: boolean
          display_order: number
          created_at: string
          pricing_type: 'per_person' | 'per_group' | null
          price_cents_per_person: number | null
          price_cents_group: number | null
          capacity_max: number | null
          commission_pct: number
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }
      service_availability: {
        Row: {
          id: string
          service_id: string
          date: string
          available: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['service_availability']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['service_availability']['Insert']>
      }
      accommodation_availability: {
        Row: {
          id: string
          listing_id: string
          date: string
          status: 'available' | 'blocked' | 'booked'
          source: 'manual' | 'ical' | 'acalanto'
          room_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['accommodation_availability']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['accommodation_availability']['Insert']>
      }
      ical_sources: {
        Row: {
          id: string
          listing_id: string
          url: string
          direction: 'import' | 'export'
          channel_type: string | null
          active: boolean
          last_synced_at: string | null
          sync_status: 'ok' | 'error' | 'pending' | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ical_sources']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ical_sources']['Insert']>
      }
      gallery: {
        Row: {
          id: string
          boat_id: string | null
          service_id: string | null
          listing_id: string | null
          room_id: string | null
          photographer_package_id: string | null
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
          vertical: string
          photographer_package_id: string | null
          utm_campaign: string | null
          commission_rate: number
          paid_at: string | null
          cpf_hash:           string | null
          asaas_payment_id:   string | null
          asaas_customer_id:  string | null
          payment_method:     string | null
          payment_status:     string
          payment_url:        string | null
          pix_qr_code:        string | null
          pix_copy_paste:        string | null
          accommodation_room_id: string | null
          check_out:             string | null
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
      capacity_overrides: {
        Row: {
          id: string
          boat_id: string
          tour_date: string
          capacity: number
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['capacity_overrides']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['capacity_overrides']['Insert']>
      }
      utm_events: {
        Row: {
          id: string
          partner_slug: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          session_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['utm_events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['utm_events']['Insert']>
      }
      payments: {
        Row: {
          id: string
          booking_id: string | null
          infinity_pay_id: string | null
          amount_cents: number
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          pix_code: string | null
          pix_expiry: string | null
          commission_rate: number
          utm_campaign: string | null
          paid_at: string | null
          raw_webhook: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      photographer_packages: {
        Row: {
          id: string
          partner_id: string
          name: string
          slug: string
          description: string | null
          price_label: string | null
          price_cents: number | null
          duration_label: string | null
          includes: string[]
          cover_image: string | null
          active: boolean
          display_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['photographer_packages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['photographer_packages']['Insert']>
      }
      partner_pages: {
        Row: {
          id: string
          partner_id: string
          slug: string
          headline: string | null
          bio: string | null
          cover_image: string | null
          instagram_url: string | null
          whatsapp_number: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['partner_pages']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['partner_pages']['Insert']>
      }
      nps_surveys: {
        Row: {
          id: string
          booking_id: string
          token: string
          token_expires: string
          score: number | null
          comment: string | null
          submitted_at: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['nps_surveys']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['nps_surveys']['Insert']>
      }
      payouts: {
        Row: {
          id: string
          partner_id: string
          period_month: string
          gross_cents: number
          commission_cents: number
          net_cents: number
          status: 'pending' | 'paid'
          paid_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payouts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payouts']['Insert']>
      }
      evolution_tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'backlog' | 'doing' | 'done' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['evolution_tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['evolution_tasks']['Insert']>
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          title: string
          summary: string | null
          content: string
          cover_url: string | null
          published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          summary?: string | null
          content?: string
          cover_url?: string | null
          published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>
      }
      service_providers: {
        Row: {
          id: string
          service_id: string
          partner_id: string
          notes: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          partner_id: string
          notes?: string | null
          display_order?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['service_providers']['Insert']>
      }
      accommodation_rooms: {
        Row: {
          id: string
          listing_id: string
          name: string
          description: string | null
          price_per_night_cents: number
          price_extra_guest_cents: number
          max_guests: number
          min_nights: number
          amenities: string[]
          cover_image: string | null
          display_order: number
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['accommodation_rooms']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['accommodation_rooms']['Insert']>
      }
      roadmap_tasks: {
        Row: {
          id:          string
          area:        string
          title:       string
          description: string | null
          status:      string
          priority:    string
          eta:         string | null
          notes:       string | null
          sort_order:  number
          created_at:  string
          updated_at:  string
        }
        Insert: Omit<Database['public']['Tables']['roadmap_tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['roadmap_tasks']['Insert']>
      }
      partner_listings: {
        Row: {
          id:               string
          partner_id:       string
          type:             'hospedagem' | 'fotografia' | 'jeep' | 'guia' | 'barco'
          title:            string
          slug:             string
          description:      string | null
          price_label:      string | null
          cover_image:      string | null
          gallery:          string[]
          metadata:         Json
          boat_id:          string | null
          status:           'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          active:           boolean
          created_at:       string
          updated_at:       string
        }
        Insert: {
          id?:              string
          partner_id:       string
          type:             'hospedagem' | 'fotografia' | 'jeep' | 'guia' | 'barco'
          title:            string
          slug:             string
          description?:     string | null
          price_label?:     string | null
          cover_image?:     string | null
          gallery?:         string[]
          metadata?:        Json
          boat_id?:         string | null
          status?:          'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          active?:          boolean
          created_at?:      string
          updated_at?:      string
        }
        Update: {
          partner_id?:      string
          type?:            'hospedagem' | 'fotografia' | 'jeep' | 'guia' | 'barco'
          title?:           string
          slug?:            string
          description?:     string | null
          price_label?:     string | null
          cover_image?:     string | null
          gallery?:         string[]
          metadata?:        Json
          boat_id?:         string | null
          status?:          'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          active?:          boolean
          updated_at?:      string
        }
      }
      admin_users: {
        Row: {
          id: string
          role: 'super_admin' | 'pdv' | 'tripulacao' | 'fotografo'
          display_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          role: 'super_admin' | 'pdv' | 'tripulacao' | 'fotografo'
          display_name?: string | null
        }
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>
      }
    }
  }
}

export type AdminUserRow = Database['public']['Tables']['admin_users']['Row']

// Existing aliases
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

// New marketplace aliases
export type CapacityOverride = Database['public']['Tables']['capacity_overrides']['Row']
export type UtmEvent = Database['public']['Tables']['utm_events']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type PhotographerPackage = Database['public']['Tables']['photographer_packages']['Row']
export type PartnerPage = Database['public']['Tables']['partner_pages']['Row']
export type NpsSurvey = Database['public']['Tables']['nps_surveys']['Row']
export type Payout = Database['public']['Tables']['payouts']['Row']
export type EvolutionTask = Database['public']['Tables']['evolution_tasks']['Row']
export type ServiceAvailability = Database['public']['Tables']['service_availability']['Row']
export type AccommodationAvailability = Database['public']['Tables']['accommodation_availability']['Row']
export type ICalSource = Database['public']['Tables']['ical_sources']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type RoadmapTask = Database['public']['Tables']['roadmap_tasks']['Row']
export type AccommodationRoom = Database['public']['Tables']['accommodation_rooms']['Row']
export type ServiceProvider = {
  id: string
  partner_id: string
  notes: string | null
  display_order: number
  partner: {
    id: string
    name: string
    description: string | null
    whatsapp_number: string | null
  }
}
