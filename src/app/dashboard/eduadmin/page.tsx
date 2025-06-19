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
import { testService, centerService } from '@/lib/database'
import type { User, Test, EducationCenter } from '@/lib/supabase'

export default function EduAdminDashboard() {
  const [students, setStudents] = useState<User[]>([])
  const [tests, setTests] = useState<Test[]>([])
  const [center, setCenter] = useState<EducationCenter | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('students')
  const [showCreateTest, setShowCreateTest] = useState(false)
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    type: 'academic',
    duration: 150
  })
  const router = useRouter()
  const { profile, signOut } = useAuth()

  useEffect(() => {
    if (profile) {
      loadData()
    }
  }, [profile])

  const loadData = async () => {
    try {
      // Fetch users with emails from the API
      const usersRes = await fetch('/api/users-with-emails')
      const usersData = await usersRes.json()
      const [testsData, centerData] = await Promise.all([
        testService.getAllTests(),
        centerService.getCenterById(profile?.center_id || '')
      ])
      // Filter students from same education center
      const centerStudents = usersData.filter((u: User) => 
        u.role === 'user' && u.center_id === profile?.center_id
      )
      setStudents(centerStudents)
      setTests(testsData)
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

  const handleCreateTest = async () => {
    if (!newTest.title || !newTest.description || !profile?.center_id) return
    try {
      // Create test using the service
      const createdTest = await testService.createTest({
        title: newTest.title,
        description: newTest.description,
        center_id: profile.center_id,
        questions: [] // Will be added later
      })
      setTests([...tests, createdTest])
      setNewTest({ title: '', description: '', type: 'academic', duration: 150 })
      setShowCreateTest(false)
    } catch (error) {
      console.error('Error creating test:', error)
    }
  }

  const getStudentStats = (studentId: string) => {
    // This will be implemented when we add assignments and results
    return { total: 0, completed: 0, avgScore: 0 }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['eduadmin']}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['eduadmin']}>
      <PageTransition>
        <div className="min-h-screen p-4">
          {/* Header */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gradient">EduAdmin Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back, {profile?.name || 'Admin'}!</p>
                <p className="text-sm text-gray-500">{center?.name}</p>
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
                { id: 'students', label: 'Students', icon: '👥' },
                { id: 'tests', label: 'Tests', icon: '📝' },
                { id: 'results', label: 'Results', icon: '📊' }
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
            {/* Students Tab */}
            {activeTab === 'students' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Students</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map((student) => {
                    const stats = getStudentStats(student.id)
                    return (
                      <Card key={student.id}>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">👤</span>
                          </div>
                          <h3 className="font-semibold text-lg">{student.name || 'Student'}</h3>
                          <p className="text-gray-600">{student.email || student.user_id}</p>
                          <p className="text-sm text-gray-500">{student.phone || 'No phone'}</p>
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Tests Assigned:</span>
                              <span className="font-medium">{stats.total}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Completed:</span>
                              <span className="font-medium">{stats.completed}</span>
                            </div>
                            {stats.avgScore && (
                              <div className="flex justify-between text-sm">
                                <span>Avg Score:</span>
                                <span className="font-medium">{stats.avgScore.toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-4">
                            <Button variant="secondary">View Details</Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tests Tab */}
            {activeTab === 'tests' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Tests</h2>
                  <Button onClick={() => setShowCreateTest(!showCreateTest)}>
                    {showCreateTest ? 'Cancel' : 'Create Test'}
                  </Button>
                </div>

                {showCreateTest && (
                  <Card className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Create New Test</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Test Title"
                        type="text"
                        placeholder="Enter test title"
                        value={newTest.title}
                        onChange={(e) => setNewTest({...newTest, title: e.target.value})}
                      />
                      <InputField
                        label="Description"
                        type="text"
                        placeholder="Enter test description"
                        value={newTest.description}
                        onChange={(e) => setNewTest({...newTest, description: e.target.value})}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Test Type
                        </label>
                        <select
                          value={newTest.type}
                          onChange={(e) => setNewTest({...newTest, type: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        >
                          <option value="academic">Academic</option>
                          <option value="general">General Training</option>
                        </select>
                      </div>
                      <InputField
                        label="Duration (minutes)"
                        type="number"
                        placeholder="150"
                        value={newTest.duration.toString()}
                        onChange={(e) => setNewTest({...newTest, duration: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="mt-4">
                      <Button onClick={handleCreateTest}>Create Test</Button>
                    </div>
                  </Card>
                )}

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
                          <Button variant="secondary">Manage Test</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Results Tab */}
            {activeTab === 'results' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Test Results</h2>
                <Card>
                  <p className="text-center text-gray-500 py-8">
                    Test results will be displayed here when students complete tests.
                  </p>
                </Card>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}

