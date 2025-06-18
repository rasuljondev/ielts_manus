'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/Button'
import InputField from '@/components/InputField'
import Card from '@/components/Card'
import PageTransition from '@/components/PageTransition'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    educationCenter: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const educationCenters = [
    'Cambridge English Center',
    'Oxford Language Institute',
    'British Council',
    'IDP Education',
    'IELTS Academy',
    'Global English Center'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.educationCenter) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock signup success
    setSuccess(true)
    
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    
    setIsLoading(false)
  }

  if (success) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Account Created Successfully!
              </h2>
              <p className="text-gray-600 mb-4">
                Redirecting to login page...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            </motion.div>
          </Card>
        </div>
      </PageTransition>
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
                Join IELTS Platform
              </h1>
              <p className="text-gray-600">Create your student account</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <InputField
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />

              <InputField
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />

              <InputField
                label="Password"
                type="password"
                placeholder="Enter your password (min 8 characters)"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />

              <InputField
                label="Phone Number"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />

              <motion.div
                className="mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education Center <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.educationCenter}
                  onChange={(e) => handleInputChange('educationCenter', e.target.value)}
                  required
                  className="input-field"
                >
                  <option value="">Select your education center</option>
                  {educationCenters.map((center) => (
                    <option key={center} value={center}>
                      {center}
                    </option>
                  ))}
                </select>
              </motion.div>

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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </motion.div>
        </Card>
      </div>
    </PageTransition>
  )
}

