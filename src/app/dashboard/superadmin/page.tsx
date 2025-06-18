'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/Button'
import Card from '@/components/Card'
import InputField from '@/components/InputField'
import PageTransition from '@/components/PageTransition'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { userService, centerService, testService } from '@/lib/database'
import type { User, EducationCenter, Test } from '@/lib/supabase'

export default function SuperAdminDashboard() {
  const [eduAdmins, setEduAdmins] = useState<User[]>([])
  const [centers, setCenters] = useState<EducationCenter[]>([])
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()
  const { profile, signOut } = useAuth()

  useEffect(() => {
    if (profile) {
      loadData()
    }
  }, [profile])

  const loadData = async () => {
    try {
      const [usersData, centersData, testsData] = await Promise.all([
        userService.getAllUsers(),
        centerService.getAllCenters(),
        testService.getAllTests()
      ])

      // Filter EduAdmins
      const adminUsers = usersData.filter((u: User) => u.role === 'eduadmin')

      setEduAdmins(adminUsers)
      setCenters(centersData)
      setTests(testsData)
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

  const getTotalStats = () => {
    const totalStudents = 0 // Will be calculated from users with role 'user'
    const totalTests = tests.length
    const activeCenters = centers.length

    return { totalStudents, totalTests, activeCenters, totalCenters: centers.length }
  }

  const stats = getTotalStats()

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['superadmin']}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['superadmin']}>
      <PageTransition>
        <div className="min-h-screen p-4">
          {/* Header */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gradient">SuperAdmin Dashboard</h1>
                <p className="text-gray-600 mt-2">Platform Management & Analytics</p>
                {profile && (
                  <p className="text-sm text-gray-500">Welcome, {profile.name}</p>
                )}
              </div>
              <Button onClick={handleLogout} variant="secondary">
                Logout
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'admins', label: 'EduAdmins', icon: '👨‍💼' },
                { id: 'centers', label: 'Centers', icon: '🏢' },
                { id: 'tests', label: 'Tests', icon: '📝' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Quick Actions */}
            <div className="mt-4 flex gap-4">
              <Button
                onClick={() => router.push('/dashboard/superadmin/eduadmin-management')}
                className="btn-primary"
              >
                Add Education Center
              </Button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Platform Overview</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {stats.totalCenters}
                      </div>
                      <div className="text-gray-600">Total Centers</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {stats.activeCenters} active
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {eduAdmins.length}
                      </div>
                      <div className="text-gray-600">EduAdmins</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Active administrators
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {tests.length}
                      </div>
                      <div className="text-gray-600">Total Tests</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Available tests
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {stats.totalStudents}
                      </div>
                      <div className="text-gray-600">Students</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Registered users
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">New EduAdmin Created</p>
                        <p className="text-sm text-gray-600">John Doe - IELTS Academy London</p>
                      </div>
                      <span className="text-sm text-gray-500">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Test Completed</p>
                        <p className="text-sm text-gray-600">IELTS Academic Reading Test 1</p>
                      </div>
                      <span className="text-sm text-gray-500">4 hours ago</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* EduAdmins Tab */}
            {activeTab === 'admins' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">EduAdmins</h2>
                  <Button onClick={() => router.push('/dashboard/superadmin/eduadmin-management')}>
                    Manage EduAdmins
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eduAdmins.map((admin) => (
                    <Card key={admin.id}>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">👨‍💼</span>
                        </div>
                        <h3 className="font-semibold text-lg">{admin.name || 'Admin'}</h3>
                        <p className="text-gray-600">{admin.user_id}</p>
                        <p className="text-sm text-gray-500">{admin.phone || 'No phone'}</p>
                        <div className="mt-4">
                          <Button variant="secondary">Edit</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Centers Tab */}
            {activeTab === 'centers' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Education Centers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {centers.map((center) => (
                    <Card key={center.id}>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">🏢</span>
                        </div>
                        <h3 className="font-semibold text-lg">{center.name}</h3>
                        <p className="text-gray-600">{center.location}</p>
                        <div className="mt-4">
                          <Button variant="secondary">View Details</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Tests Tab */}
            {activeTab === 'tests' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Tests</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tests.map((test) => (
                    <Card key={test.id}>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">📝</span>
                        </div>
                        <h3 className="font-semibold text-lg">{test.title}</h3>
                        <p className="text-gray-600 text-sm">{test.description}</p>
                        <div className="mt-4">
                          <Button variant="secondary">View Details</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}

