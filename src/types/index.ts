export interface Review {
  id: string
  author_name: string
  rating: number
  content: string
  status: 'pending' | 'approved'
  created_at: string
  updated_at: string
}

