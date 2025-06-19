'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { authService } from '@/lib/database'
import type { User as UserProfile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, phone: string, centerId: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = async (currentUser: User | null) => {
    if (currentUser) {
      try {
        const userProfile = await authService.getCurrentUserProfile()
        setProfile(userProfile)
        
        // TODO: Re-enable this after login flow is working
        // Check if EduAdmin needs to complete profile
        // if (userProfile && userProfile.role === 'eduadmin' && (!userProfile.name || !userProfile.phone)) {
        //   // Redirect to profile completion
        //   window.location.href = '/profile/complete'
        // }
      } catch (error) {
        console.error('Error getting user profile:', error)
        setProfile(null)
      }
    } else {
      setProfile(null)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
        if (currentUser) {
          await loadUserProfile(currentUser)
        }
      } catch (error: any) {
        if (
          error?.name === 'AuthSessionMissingError' ||
          error?.message?.includes('Auth session missing')
        ) {
          setUser(null)
          setProfile(null)
        } else {
          console.error('Error getting initial session:', error)
          setUser(null)
          setProfile(null)
        }
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        try {
          const currentUser = session?.user ?? null
          setUser(currentUser)
          if (currentUser) {
            await loadUserProfile(currentUser)
          } else {
            setProfile(null)
          }
        } catch (error: any) {
          if (
            error?.name === 'AuthSessionMissingError' ||
            error?.message?.includes('Auth session missing')
          ) {
            setUser(null)
            setProfile(null)
          } else {
            console.error('Error in onAuthStateChange:', error)
            setUser(null)
            setProfile(null)
          }
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const result = await authService.signIn(email, password)
      console.log('Sign in successful:', result.user?.email)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string, phone: string, centerId: string) => {
    try {
      setLoading(true)
      await authService.signUp({
        email,
        password,
        name,
        phone,
        center_id: centerId,
      })
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await authService.signOut()
      setUser(null)
      setProfile(null)
      setLoading(false)
      // Force reload to clear all state and session data
      window.location.href = '/login'
    } catch (error) {
      console.error('Sign out error:', error)
      setLoading(false)
      throw error
    }
  }

  const refreshProfile = async () => {
    try {
      await loadUserProfile(user)
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 