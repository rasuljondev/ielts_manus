import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types matching the new schema
export interface EducationCenter {
  id: string
  name: string
  location: string
  created_at: string
}

export interface User {
  id: string
  user_id: string // Links to Supabase auth.users
  name: string
  phone?: string
  role: 'superadmin' | 'eduadmin' | 'user'
  center_id?: string
  created_at: string
  email?: string
}

export interface Test {
  id: string
  title: string
  description?: string
  created_by: string
  center_id: string
  created_at: string
  is_active: boolean
}

export interface Question {
  id: string
  test_id: string
  type: 'mcq' | 'gap' | 'tf' | 'short'
  question: string
  options?: string[]
  correct_answer: string
  section: 'reading' | 'listening' | 'writing'
  order_index: number
  points: number
}

export interface AssignedTest {
  id: string
  user_id: string
  test_id: string
  status: 'assigned' | 'in_progress' | 'completed' | 'confirmed'
  score?: number
  confirmed_by_admin?: string
  started_at?: string
  submitted_at?: string
  assigned_at: string
}

export interface Answer {
  id: string
  assigned_test_id: string
  question_id: string
  user_answer?: string
  is_correct?: boolean
  answered_at: string
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  created_at: string
}

// Extended user profile for signup
export interface SignupData {
  email: string
  password: string
  name: string
  phone: string
  center_id: string
}

// Test creation data
export interface CreateTestData {
  title: string
  description?: string
  center_id: string
  questions: Omit<Question, 'id' | 'test_id'>[]
}

// Assignment data
export interface AssignTestData {
  user_id: string
  test_id: string
} 