'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/Button'
import PageTransition from '@/components/PageTransition'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const router = useRouter()
  const { signOut } = useAuth()

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      router.push(`/dashboard/${userData.role}`)
    }
  }, [router])

  const handleSignIn = async () => {
    await signOut()
    router.push('/login')
  }

  const handleSignUp = async () => {
    await signOut()
    router.push('/signup')
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-gradient mb-6">
              IELTS Platform
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your comprehensive mock exam system for IELTS preparation with advanced analytics and personalized learning paths.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              onClick={handleSignIn}
              className="text-lg px-8 py-4"
            >
              Sign In
            </Button>
            <Button
              onClick={handleSignUp}
              variant="secondary"
              className="text-lg px-8 py-4"
            >
              Create Account
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Tests</h3>
              <p className="text-gray-600">Full IELTS mock exams with Reading, Listening, and Writing sections</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
              <p className="text-gray-600">Track your progress with comprehensive performance analytics</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Multi-Role System</h3>
              <p className="text-gray-600">Designed for students, educators, and administrators</p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}

