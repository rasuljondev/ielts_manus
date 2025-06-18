'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/Button'
import InputField from '@/components/InputField'
import Card from '@/components/Card'
import PageTransition from '@/components/PageTransition'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Mock authentication logic
    const mockCredentials = {
      'superadmin@gmail.com': { password: '12345678', role: 'superadmin' },
      'eduadmin@gmail.com': { password: '12345678', role: 'eduadmin' },
      'user@gmail.com': { password: '12345678', role: 'user' }
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user = mockCredentials[email as keyof typeof mockCredentials]
    
    if (user && user.password === password) {
      // Store user info in localStorage (mock session)
      localStorage.setItem('user', JSON.stringify({ email, role: user.role }))
      
      // Redirect based on role
      switch (user.role) {
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
    } else {
      setError('Invalid email or password')
    }
    
    setIsLoading(false)
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
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <InputField
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <InputField
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/signup')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Demo Credentials:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>SuperAdmin:</strong> superadmin@gmail.com / 12345678</p>
                <p><strong>EduAdmin:</strong> eduadmin@gmail.com / 12345678</p>
                <p><strong>User:</strong> user@gmail.com / 12345678</p>
              </div>
            </div>
          </motion.div>
        </Card>
      </div>
    </PageTransition>
  )
}

