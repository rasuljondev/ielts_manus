'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/Button'
import InputField from '@/components/InputField'
import Card from '@/components/Card'
import PageTransition from '@/components/PageTransition'
import { useAuth } from '@/contexts/AuthContext'
import { userService } from '@/lib/database'

export default function CompleteProfilePage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { profile, refreshProfile } = useAuth()

  useEffect(() => {
    // If profile is already complete, redirect to dashboard
    if (profile && profile.name && profile.phone) {
      redirectToDashboard()
    }
  }, [profile])

  const redirectToDashboard = () => {
    if (!profile) return
    
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!name.trim() || !phone.trim()) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      // Update user profile
      await userService.updateUser(profile?.id || '', {
        name: name.trim(),
        phone: phone.trim()
      })

      // Refresh profile in context
      await refreshProfile()

      // Redirect to appropriate dashboard
      redirectToDashboard()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setError(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading if profile is not loaded yet
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // If profile is already complete, show loading while redirecting
  if (profile.name && profile.phone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gradient mb-2">
                Complete Your Profile
              </h1>
              <p className="text-gray-600">Please provide your information to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <InputField
                label="Phone Number"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Updating...' : 'Complete Profile'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Welcome to {profile.role === 'eduadmin' ? 'EduAdmin' : 'Student'} dashboard!
              </p>
            </div>
          </motion.div>
        </Card>
      </div>
    </PageTransition>
  )
} 