'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const router = useRouter()
  const { profile, loading } = useAuth()

  useEffect(() => {
    if (!loading && profile) {
      // Redirect based on role
      switch (profile.role) {
        case 'superadmin':
          router.replace('/dashboard/superadmin')
          break
        case 'eduadmin':
          router.replace('/dashboard/eduadmin')
          break
        case 'user':
          router.replace('/dashboard/user')
          break
        default:
          console.error('Unknown role:', profile.role)
          router.replace('/login')
      }
    } else if (!loading && !profile) {
      // No profile, redirect to login
      router.replace('/login')
    }
  }, [profile, loading, router])

  // Show loading while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  )
} 