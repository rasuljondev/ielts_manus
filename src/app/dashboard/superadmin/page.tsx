'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/Button'
import Card from '@/components/Card'
import InputField from '@/components/InputField'
import PageTransition from '@/components/PageTransition'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { centerService, testService, userService, assignedTestService } from '@/lib/database'
import type { User, EducationCenter, Test } from '@/lib/supabase'

export default function SuperAdminDashboard() {
  const [eduAdmins, setEduAdmins] = useState<User[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [centers, setCenters] = useState<EducationCenter[]>([])
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [activities, setActivities] = useState<any[]>([])
  const router = useRouter()
  const { profile, signOut } = useAuth()

  useEffect(() => {
    if (profile) {
      loadData()
      loadActivities()
    }
  }, [profile])

  const loadData = async () => {
    try {
      // Fetch users with emails from the API
      const usersRes = await fetch('/api/users-with-emails')
      const usersData = await usersRes.json()
      const [centersData, testsData] = await Promise.all([
        centerService.getAllCenters(),
        testService.getAllTests()
      ])
      setCenters(centersData)
      setEduAdmins(usersData.filter((u: User) => u.role === 'eduadmin'))
      setStudents(usersData.filter((u: User) => u.role === 'user'))
      setTests(testsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCenterName = (centerId: string) => {
    const center = centers.find((c) => c.id === centerId)
    return center ? center.name : ''
  }

  const loadActivities = async () => {
    try {
      // Fetch users with emails from the API
      const usersRes = await fetch('/api/users-with-emails')
      if (!usersRes.ok) {
        throw new Error('Failed to fetch users data')
      }
      const usersData = await usersRes.json()

      const [tests, assignedTests, centers] = await Promise.all([
        testService.getAllTests(),
        assignedTestService.getAllAssignedTests(),
        centerService.getAllCenters()
      ])

      // 1. New user signups (students, eduadmins)
      const userActivities = usersData
        .filter((u: any) => u.role === 'user' || u.role === 'eduadmin')
        .map((u: any) => {
          const center = centers.find(c => c.id === u.center_id)
          return {
            type: u.role === 'user' ? 'student_signup' : 'eduadmin_signup',
            who: u.name,
            email: u.email,
            phone: u.phone,
            center: center?.name,
            time: u.created_at,
            role: u.role
          }
        })

      // 2. Test created by eduadmin
      const testActivities = tests.map((t: any) => {
        const creator = usersData.find((u: any) => u.id === t.created_by)
        return {
          type: 'test_created',
          who: creator?.name || 'Unknown',
          email: creator?.email,
          center: getCenterName(creator?.center_id || ''),
          testTitle: t.title,
          time: t.created_at,
        }
      })
      // 3. Result confirmed by eduadmin (assigned_tests with confirmed_by_admin)
      const resultActivities = assignedTests
        .filter((at: any) => at.confirmed_by_admin && at.status === 'confirmed')
        .map((at: any) => {
          const eduadmin = usersData.find((u: any) => u.id === at.confirmed_by_admin)
          const student = usersData.find((u: any) => u.id === at.user_id)
          const test = tests.find((t: any) => t.id === at.test_id)
          return {
            type: 'result_confirmed',
            who: eduadmin?.name || 'Unknown',
            email: eduadmin?.email,
            center: getCenterName(eduadmin?.center_id || ''),
            student: student?.name,
            testTitle: test?.title,
            time: at.submitted_at || at.updated_at || at.confirmed_at || at.assigned_at,
          }
        })

      // Sort activities by time
      const allActivities = [
        ...userActivities,
        ...testActivities,
        ...resultActivities,
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      
      setActivities(allActivities)
    } catch (error) {
      console.error('Error loading activities:', error)
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
    const totalStudents = students.length
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
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push('/dashboard/superadmin/eduadmin-management')}
                  className="btn-primary"
                >
                  Add Education Center
                </Button>
                <Button onClick={handleLogout} variant="secondary">
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'admins', label: 'EduAdmins', icon: '👨‍💼' },
                { id: 'students', label: 'Students', icon: '👩‍🎓' },
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
                    {activities.length === 0 ? (
                      <div className="text-center text-gray-400 py-6">No recent activity.</div>
                    ) : (
                      activities.slice(0, 8).map((a, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            {a.type === 'student_signup' && (
                              <>
                                <p className="font-medium">New Student Signup</p>
                                <p className="text-sm text-gray-600">
                                  {a.who} {a.phone}
                                </p>
                              </>
                            )}
                            {a.type === 'eduadmin_signup' && (
                              <>
                                <p className="font-medium">New EduAdmin Signup</p>
                                <p className="text-sm text-gray-600">
                                  {a.center} - {a.email || 'No email'}
                                </p>
                              </>
                            )}
                            {a.type === 'test_created' && (
                              <>
                                <p className="font-medium">Test Created</p>
                                <p className="text-sm text-gray-600">
                                  {a.who} – {a.email} {a.center && <>– {a.center}</>}<br />
                                  <span className="font-semibold">{a.testTitle}</span>
                                </p>
                              </>
                            )}
                            {a.type === 'result_confirmed' && (
                              <>
                                <p className="font-medium">Result Confirmed</p>
                                <p className="text-sm text-gray-600">
                                  {a.who} – {a.email} {a.center && <>– {a.center}</>}<br />
                                  Confirmed <span className="font-semibold">{a.student}</span>'s result for <span className="font-semibold">{a.testTitle}</span>
                                </p>
                              </>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{new Date(a.time).toLocaleString()}</span>
                        </div>
                      ))
                    )}
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
                        <p className="text-gray-600">{admin.email || admin.user_id}</p>
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

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Students</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map((student) => (
                    <Card key={student.id}>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">👩‍🎓</span>
                        </div>
                        <h3 className="font-semibold text-lg">{student.name || 'Student'}</h3>
                        <p className="text-gray-600">{student.email || student.user_id}</p>
                        <p className="text-sm text-gray-500">{student.phone || 'No phone'}</p>
                        <div className="mt-4">
                          <Button variant="secondary">View Details</Button>
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

