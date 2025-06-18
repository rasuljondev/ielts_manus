'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageTransition from '@/components/PageTransition'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { testService, centerService } from '@/lib/database'
import type { Test, EducationCenter } from '@/lib/supabase'

export default function UserDashboard() {
  const [tests, setTests] = useState<Test[]>([])
  const [center, setCenter] = useState<EducationCenter | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { profile, signOut } = useAuth()

  useEffect(() => {
    if (profile) {
      loadData()
    }
  }, [profile])

  const loadData = async () => {
    try {
      const [testsData, centerData] = await Promise.all([
        testService.getAllTests(),
        centerService.getCenterById(profile?.center_id || '')
      ])

      // Filter tests for this center
      const centerTests = testsData.filter((t: Test) => t.center_id === profile?.center_id)

      setTests(centerTests)
      setCenter(centerData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleStartTest = (testId: string) => {
    router.push(`/test/start/${testId}`)
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['user']}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <PageTransition>
        <div className="min-h-screen p-4">
          {/* Header */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gradient">Student Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back, {profile?.name || 'Student'}!</p>
                <p className="text-sm text-gray-500">{center?.name}</p>
              </div>
              <Button onClick={handleLogout} variant="secondary">
                Logout
              </Button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            {/* Available Tests */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Available Tests</h2>
              {tests.length === 0 ? (
                <Card>
                  <p className="text-center text-gray-500 py-8">
                    No tests are currently available. Check back later!
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tests.map((test) => (
                    <Card key={test.id}>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">📝</span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{test.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{test.description}</p>
                        <div className="mt-4">
                          <Button 
                            onClick={() => handleStartTest(test.id)}
                            className="w-full"
                          >
                            Start Test
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Test History */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Test History</h2>
              <Card>
                <p className="text-center text-gray-500 py-8">
                  Your test history will appear here after you complete tests.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}

