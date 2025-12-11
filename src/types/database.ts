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

