export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      settings: {
        Row: {
          id: string
          key: string
          value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: number
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          author_name: string
          rating: number
          content: string
          status: 'pending' | 'approved'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_name: string
          rating: number
          content: string
          status?: 'pending' | 'approved'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_name?: string
          rating?: number
          content?: string
          status?: 'pending' | 'approved'
          created_at?: string
          updated_at?: string
        }
      }
      popular_destinations: {
        Row: {
          id: string
          name_fr: string
          name_en: string
          address: string
          icon: string | null
          fixed_price: number
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_fr: string
          name_en: string
          address: string
          icon?: string | null
          fixed_price: number
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_fr?: string
          name_en?: string
          address?: string
          icon?: string | null
          fixed_price?: number
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          first_name: string
          last_name: string
          phone: string
          email: string | null
          is_online: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          phone: string
          email?: string | null
          is_online?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          phone?: string
          email?: string | null
          is_online?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          departure_address: string
          arrival_address: string
          scheduled_date: string | null
          ride_type: 'immediate' | 'reservation'
          vehicle_category: 'standard' | 'berline' | 'van'
          is_round_trip: boolean
          number_of_passengers: number
          baby_seat: boolean
          payment_method: 'cash' | 'card'
          estimated_price: number
          estimated_distance: number | null
          estimated_duration: number | null
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          driver_id: string | null
          driver_assigned_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          departure_address: string
          arrival_address: string
          scheduled_date?: string | null
          ride_type: 'immediate' | 'reservation'
          vehicle_category: 'standard' | 'berline' | 'van'
          is_round_trip?: boolean
          number_of_passengers?: number
          baby_seat?: boolean
          payment_method: 'cash' | 'card'
          estimated_price: number
          estimated_distance?: number | null
          estimated_duration?: number | null
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          driver_id?: string | null
          driver_assigned_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          departure_address?: string
          arrival_address?: string
          scheduled_date?: string | null
          ride_type?: 'immediate' | 'reservation'
          vehicle_category?: 'standard' | 'berline' | 'van'
          is_round_trip?: boolean
          number_of_passengers?: number
          baby_seat?: boolean
          payment_method?: 'cash' | 'card'
          estimated_price?: number
          estimated_distance?: number | null
          estimated_duration?: number | null
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          driver_id?: string | null
          driver_assigned_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

