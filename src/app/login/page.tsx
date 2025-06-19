'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/Button'
import InputField from '@/components/InputField'
import Card from '@/components/Card'
import PageTransition from '@/components/PageTransition'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const [forgotStep, setForgotStep] = useState<'choose' | 'user' | 'admin' | 'done'>('choose')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg, setForgotMsg] = useState('')
  const [forgotErr, setForgotErr] = useState('')
  const router = useRouter()
  const { signIn, profile, loading } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && profile) {
      redirectBasedOnRole(profile.role)
    }
  }, [profile, loading])

  const redirectBasedOnRole = (role: string) => {
    // Redirect to main dashboard page which will handle role-based routing
    router.push('/dashboard')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await signIn(email, password)
      // Don't redirect here - let the useEffect handle it when profile loads
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  // Forgot password logic
  const handleForgotSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotMsg('')
    setForgotErr('')
    if (!forgotEmail) {
      setForgotErr('Please enter your email.')
      return
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail)
      if (error) {
        setForgotErr(error.message)
        return
      }
      setForgotMsg('Password reset email sent! Check your inbox.')
      setForgotStep('done')
    } catch (err: any) {
      setForgotErr(err.message || 'Failed to send reset email')
    }
  }

  // Show loading if auth is still loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Don't show login form if already authenticated
  if (profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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

            <div className="flex justify-between items-center mt-4">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/signup')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </button>
              </p>
              <button
                className="text-blue-600 hover:underline text-sm font-medium"
                onClick={() => { setShowForgot(true); setForgotStep('choose'); setForgotEmail(''); setForgotMsg(''); setForgotErr(''); }}
                type="button"
              >
                Forgot Password?
              </button>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Demo Credentials:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>SuperAdmin:</strong> superadmin@gmail.com / 12345678</p>
                <p><strong>EduAdmin:</strong> eduadmin@gmail.com / 12345678</p>
                <p><strong>User:</strong> user@gmail.com / 12345678</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Note: These are demo credentials. In production, users will sign up through the signup page.
              </p>
            </div>
          </motion.div>
        </Card>

        {/* Forgot Password Modal */}
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative"
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowForgot(false)}
                aria-label="Close"
                type="button"
              >
                &times;
              </button>
              {forgotStep === 'choose' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
                  <p className="mb-6 text-gray-600">Are you a user or admin?</p>
                  <div className="flex gap-4">
                    <Button onClick={() => setForgotStep('user')} className="flex-1">User</Button>
                    <Button onClick={() => setForgotStep('admin')} variant="secondary" className="flex-1">Admin</Button>
                  </div>
                </div>
              )}
              {forgotStep === 'user' && (
                <form onSubmit={handleForgotSend} className="space-y-4">
                  <h2 className="text-xl font-bold mb-2">Reset Password</h2>
                  <InputField
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">Send Reset Email</Button>
                  {forgotMsg && <div className="text-green-600 text-sm text-center">{forgotMsg}</div>}
                  {forgotErr && <div className="text-red-600 text-sm text-center">{forgotErr}</div>}
                  <div className="text-center mt-2">
                    <button type="button" className="text-blue-600 hover:underline text-sm" onClick={() => setForgotStep('choose')}>Back</button>
                  </div>
                </form>
              )}
              {forgotStep === 'admin' && (
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-4">Admin Password Reset</h2>
                  <p className="mb-4 text-gray-600">Call super admin <span className="font-semibold">99 220 08 80</span> to reset your password.</p>
                  <Button onClick={() => setShowForgot(false)} className="w-full">Close</Button>
                  <div className="text-center mt-2">
                    <button type="button" className="text-blue-600 hover:underline text-sm" onClick={() => setForgotStep('choose')}>Back</button>
                  </div>
                </div>
              )}
              {forgotStep === 'done' && (
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-4">Check Your Email</h2>
                  <p className="mb-4 text-green-600">A password reset email has been sent if the email exists in our system.</p>
                  <Button onClick={() => setShowForgot(false)} className="w-full">Close</Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}

