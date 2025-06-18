'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/Button'
import InputField from '@/components/InputField'
import Card from '@/components/Card'
import PageTransition from '@/components/PageTransition'
import { useAuth } from '@/contexts/AuthContext'
import { centerService } from '@/lib/database'
import type { EducationCenter } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [centerId, setCenterId] = useState('')
  const [centers, setCenters] = useState<EducationCenter[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { signUp } = useAuth()

  useEffect(() => {
    // Load education centers
    const loadCenters = async () => {
      try {
        const centersData = await centerService.getAllCenters()
        setCenters(centersData)
      } catch (error) {
        console.error('Error loading centers:', error)
      }
    }

    loadCenters()
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    if (!centerId) {
      setError('Please select an education center')
      setIsLoading(false)
      return
    }

    try {
      // IMPORTANT: Only 'user' role can be created through signup
      await signUp(email, password, name, phone, centerId)
      
      // Show success message and redirect to login
      alert('Account created successfully! Please check your email to verify your account.')
      router.push('/login')
    } catch (error: any) {
      console.error('Signup error:', error)
      setError(error.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
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
                IELTS Platform
              </h1>
              <p className="text-gray-600">Create your student account</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <InputField
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <InputField
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education Center *
                </label>
                <select
                  value={centerId}
                  onChange={(e) => setCenterId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                >
                  <option value="">Select an education center</option>
                  {centers.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.name} - {center.location}
                    </option>
                  ))}
                </select>
              </div>

              <InputField
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <InputField
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? 'Creating account...' : 'Create Student Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">Important Notes:</h3>
              <div className="text-sm text-blue-600 space-y-1">
                <p>• <strong>Only students can sign up through this page</strong></p>
                <p>• SuperAdmins are created manually in the database</p>
                <p>• EduAdmins are created by SuperAdmin through admin dashboard</p>
                <p>• You'll receive a verification email after signup</p>
                <p>• Password must be at least 6 characters long</p>
              </div>
            </div>
          </motion.div>
        </Card>
      </div>
    </PageTransition>
  )
}

