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

