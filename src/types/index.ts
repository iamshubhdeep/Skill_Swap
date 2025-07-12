export interface User {
  id: string
  email: string
  name: string
  location?: string
  profile_photo?: string
  is_public: boolean
  availability: string[]
  bio?: string
  is_admin: boolean
  is_banned: boolean
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  user_id: string
  name: string
  description: string
  category: string
  is_offered: boolean
  is_wanted: boolean
  level: 'beginner' | 'intermediate' | 'advanced'
  is_approved: boolean
  created_at: string
}

export interface SwapRequest {
  id: string
  requester_id: string
  provider_id: string
  requested_skill_id: string
  offered_skill_id: string
  message: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Rating {
  id: string
  swap_request_id: string
  rater_id: string
  rated_user_id: string
  rating: number
  feedback: string
  created_at: string
}

export interface AdminMessage {
  id: string
  title: string
  content: string
  type: 'update' | 'alert' | 'maintenance'
  is_active: boolean
  created_at: string
}