'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('superadmin' | 'eduadmin' | 'user')[]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['superadmin', 'eduadmin', 'user'],
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only make redirect decisions when loading is complete
    if (!loading) {
      // If not authenticated, redirect to login
      if (!user) {
        router.push(redirectTo)
        return
      }

      // If authenticated but no profile yet, wait
      if (!profile) {
        return
      }

      // If role not allowed, redirect to appropriate dashboard
      if (!allowedRoles.includes(profile.role)) {
        switch (profile.role) {
          case 'superadmin':
            router.push('/dashboard/superadmin')
            break
          case 'eduadmin':
            router.push('/dashboard/eduadmin')
            break
          case 'user':
            router.push('/dashboard/user')
            break
          default:
            router.push('/login')
        }
        return
      }
    }
  }, [user, profile, loading, allowedRoles, redirectTo, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // If not authenticated, don't render children
  if (!user) {
    return null
  }

  // If authenticated but profile is still loading, show loading
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // If role not allowed, don't render children
  if (!allowedRoles.includes(profile.role)) {
    return null
  }

  return <>{children}</>
} 