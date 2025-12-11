export interface RideCalculation {
  distance: number // en mètres
  duration: number // en secondes
  price: number // en euros
}

export interface Review {
  id: string
  author_name: string
  rating: number
  content: string
  status: 'pending' | 'approved'
  created_at: string
  updated_at: string
}

export interface Setting {
  id: string
  key: string
  value: number
  created_at: string
  updated_at: string
}

export interface PopularDestination {
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

