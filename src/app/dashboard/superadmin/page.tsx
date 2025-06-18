'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/Button'
import Card from '@/components/Card'
import InputField from '@/components/InputField'
import PageTransition from '@/components/PageTransition'

interface User {
  id: string
  name: string
  email: string
  role: string
  educationCenter?: string
  phone?: string
}

interface Center {
  id: string
  name: string
  location: string
  adminId?: string
  studentsCount: number
  testsCompleted: number
}

interface Test {
  id: string
  title: string
  description: string
  type: string
  totalDuration: number
  totalQuestions: number
  createdBy: string
}

export default function SuperAdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [eduAdmins, setEduAdmins] = useState<User[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    phone: '',
    educationCenter: ''
  })
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'superadmin') {
      router.push('/login')
      return
    }

    setUser(parsedUser)
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const [usersRes, centersRes, testsRes] = await Promise.all([
        fetch('/data/users.json'),
        fetch('/data/centers.json'),
        fetch('/data/tests.json')
      ])

      const users = await usersRes.json()
      const allCenters = await centersRes.json()
      const allTests = await testsRes.json()

      // Filter EduAdmins
      const adminUsers = users.filter((u: User) => u.role === 'eduadmin')

      setEduAdmins(adminUsers)
      setCenters(allCenters)
      setTests(allTests)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  const handleCreateAdmin = () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.educationCenter) return

    // Mock admin creation
    const adminId = (eduAdmins.length + 10).toString()
    const createdAdmin = {
      id: adminId,
      name: newAdmin.name,
      email: newAdmin.email,
      phone: newAdmin.phone,
      role: 'eduadmin',
      educationCenter: newAdmin.educationCenter,
      createdAt: new Date().toISOString()
    }

    setEduAdmins([...eduAdmins, createdAdmin])
    setNewAdmin({ name: '', email: '', phone: '', educationCenter: '' })
    setShowCreateAdmin(false)
  }

  const getTotalStats = () => {
    const totalStudents = centers.reduce((sum, center) => sum + center.studentsCount, 0)
    const totalTests = centers.reduce((sum, center) => sum + center.testsCompleted, 0)
    const activeCenters = centers.filter(c => c.adminId).length

    return { totalStudents, totalTests, activeCenters, totalCenters: centers.length }
  }

  const stats = getTotalStats()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gradient">SuperAdmin Dashboard</h1>
              <p className="text-gray-600 mt-2">Platform Management & Analytics</p>
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
                    ? 'bg-white text-primary-600 shadow-sm'
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
                    <div className="text-3xl font-bold text-primary-600 mb-2">
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
                    <div className="text-3xl font-bold text-secondary-600 mb-2">
                      {eduAdmins.length}
                    </div>
                    <div className="text-gray-600">EduAdmins</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Managing centers
                    </div>
                  </div>
                </Card>
                
                <Card>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {stats.totalStudents}
                    </div>
                    <div className="text-gray-600">Total Students</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Across all centers
                    </div>
                  </div>
                </Card>
                
                <Card>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {stats.totalTests}
                    </div>
                    <div className="text-gray-600">Tests Completed</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Platform wide
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">New EduAdmin registered</div>
                      <div className="text-sm text-gray-600">Emma Taylor joined Oxford Language Institute</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Test completed</div>
                      <div className="text-sm text-gray-600">Alice Johnson completed IELTS Academic Practice Test 1</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">New test created</div>
                      <div className="text-sm text-gray-600">John Smith created IELTS Writing Focus Test</div>
                    </div>
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
                <Button onClick={() => setShowCreateAdmin(true)}>
                  Add New EduAdmin
                </Button>
              </div>

              {showCreateAdmin && (
                <Card className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Create New EduAdmin</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Full Name"
                      value={newAdmin.name}
                      onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                      placeholder="Enter full name"
                    />
                    <InputField
                      label="Email"
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                    <InputField
                      label="Phone"
                      value={newAdmin.phone}
                      onChange={(e) => setNewAdmin({...newAdmin, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Education Center
                      </label>
                      <select
                        value={newAdmin.educationCenter}
                        onChange={(e) => setNewAdmin({...newAdmin, educationCenter: e.target.value})}
                        className="input-field"
                      >
                        <option value="">Select education center</option>
                        {centers.map((center) => (
                          <option key={center.id} value={center.name}>
                            {center.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={handleCreateAdmin}>Create EduAdmin</Button>
                    <Button variant="secondary" onClick={() => setShowCreateAdmin(false)}>
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eduAdmins.map((admin) => (
                  <Card key={admin.id}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                        <span className="text-secondary-600 font-semibold">
                          {admin.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{admin.name}</h3>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Center:</span>
                        <span className="font-medium">{admin.educationCenter}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{admin.phone}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="secondary" className="text-sm flex-1">
                        Edit
                      </Button>
                      <Button variant="secondary" className="text-sm flex-1">
                        Deactivate
                      </Button>
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
                {centers.map((center) => {
                  const admin = eduAdmins.find(a => a.id === center.adminId)
                  return (
                    <Card key={center.id}>
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">{center.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{center.location}</p>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          center.adminId ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {center.adminId ? 'Active' : 'No Admin'}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Admin:</span>
                          <span className="font-medium">
                            {admin ? admin.name : 'Not assigned'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Students:</span>
                          <span className="font-medium">{center.studentsCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tests Completed:</span>
                          <span className="font-medium">{center.testsCompleted}</span>
                        </div>
                      </div>
                      
                      <Button variant="secondary" className="w-full text-sm">
                        View Details
                      </Button>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tests Tab */}
          {activeTab === 'tests' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">All Test Templates</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tests.map((test) => {
                  const creator = eduAdmins.find(a => a.id === test.createdBy)
                  return (
                    <Card key={test.id}>
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">{test.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{test.description}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Type: {test.type}</span>
                          <span>Duration: {test.totalDuration}min</span>
                          <span>Questions: {test.totalQuestions}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-4">
                        Created by: {creator ? creator.name : 'Unknown'}
                      </div>
                      
                      <Button variant="secondary" className="w-full text-sm">
                        View Template (Read-only)
                      </Button>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

