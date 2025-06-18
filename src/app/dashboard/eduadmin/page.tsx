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
}

interface Test {
  id: string
  title: string
  description: string
  type: string
  totalDuration: number
  totalQuestions: number
  createdBy: string
  isActive: boolean
}

interface Assignment {
  id: string
  testId: string
  userId: string
  assignedBy: string
  status: string
}

interface Result {
  id: string
  userId: string
  testId: string
  status: string
  scores?: {
    overall?: number
  }
  confirmedBy?: string
}

export default function EduAdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [students, setStudents] = useState<User[]>([])
  const [tests, setTests] = useState<Test[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [results, setResults] = useState<Result[]>([])
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

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'eduadmin') {
      router.push('/login')
      return
    }

    setUser(parsedUser)
    loadData(parsedUser.email)
  }, [router])

  const loadData = async (userEmail: string) => {
    try {
      const [usersRes, testsRes, assignmentsRes, resultsRes] = await Promise.all([
        fetch('/data/users.json'),
        fetch('/data/tests.json'),
        fetch('/data/assignments.json'),
        fetch('/data/results.json')
      ])

      const users = await usersRes.json()
      const allTests = await testsRes.json()
      const allAssignments = await assignmentsRes.json()
      const allResults = await resultsRes.json()

      // Find current user
      const currentUser = users.find((u: User) => u.email === userEmail)
      if (!currentUser) return

      // Filter students from same education center
      const centerStudents = users.filter((u: User) => 
        u.role === 'user' && u.educationCenter === currentUser.educationCenter
      )

      // Filter tests created by this admin
      const adminTests = allTests.filter((t: Test) => t.createdBy === currentUser.id)

      setStudents(centerStudents)
      setTests(adminTests)
      setAssignments(allAssignments)
      setResults(allResults)
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

  const handleCreateTest = () => {
    if (!newTest.title || !newTest.description) return

    // Mock test creation
    const testId = (tests.length + 1).toString()
    const createdTest = {
      id: testId,
      title: newTest.title,
      description: newTest.description,
      type: newTest.type,
      totalDuration: newTest.duration,
      totalQuestions: newTest.type === 'writing' ? 2 : 40,
      createdBy: user?.id || '',
      isActive: true,
      sections: newTest.type === 'writing' ? [
        { id: 'writing', name: 'Writing', duration: newTest.duration, questions: 2 }
      ] : [
        { id: 'reading', name: 'Reading', duration: 60, questions: 40 },
        { id: 'listening', name: 'Listening', duration: 30, questions: 40 },
        { id: 'writing', name: 'Writing', duration: 60, questions: 2 }
      ]
    }

    setTests([...tests, createdTest])
    setNewTest({ title: '', description: '', type: 'academic', duration: 150 })
    setShowCreateTest(false)
  }

  const getStudentStats = (studentId: string) => {
    const studentAssignments = assignments.filter(a => a.userId === studentId)
    const studentResults = results.filter(r => r.userId === studentId)
    const completed = studentResults.filter(r => r.status === 'completed').length
    const avgScore = studentResults.filter(r => r.scores?.overall).length > 0
      ? studentResults
          .filter(r => r.scores?.overall)
          .reduce((sum, r) => sum + (r.scores?.overall || 0), 0) / 
        studentResults.filter(r => r.scores?.overall).length
      : null

    return { total: studentAssignments.length, completed, avgScore }
  }

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
              <h1 className="text-3xl font-bold text-gradient">EduAdmin Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
              <p className="text-sm text-gray-500">{user?.educationCenter}</p>
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
          {/* Students Tab */}
          {activeTab === 'students' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Students</h2>
                <div className="text-sm text-gray-600">
                  {students.length} students in {user?.educationCenter}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => {
                  const stats = getStudentStats(student.id)
                  return (
                    <Card key={student.id}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{student.name}</h3>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tests Assigned:</span>
                          <span className="font-medium">{stats.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completed:</span>
                          <span className="font-medium">{stats.completed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average Score:</span>
                          <span className="font-medium">
                            {stats.avgScore ? stats.avgScore.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full mt-4" 
                        variant="secondary"
                        onClick={() => router.push(`/student/${student.id}`)}
                      >
                        View Profile
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Tests</h2>
                <Button onClick={() => setShowCreateTest(true)}>
                  Create New Test
                </Button>
              </div>

              {showCreateTest && (
                <Card className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Create New Test</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Test Title"
                      value={newTest.title}
                      onChange={(e) => setNewTest({...newTest, title: e.target.value})}
                      placeholder="Enter test title"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Type
                      </label>
                      <select
                        value={newTest.type}
                        onChange={(e) => setNewTest({...newTest, type: e.target.value})}
                        className="input-field"
                      >
                        <option value="academic">Academic</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                  </div>
                  <InputField
                    label="Description"
                    value={newTest.description}
                    onChange={(e) => setNewTest({...newTest, description: e.target.value})}
                    placeholder="Enter test description"
                  />
                  <div className="flex gap-3 mt-4">
                    <Button onClick={handleCreateTest}>Create Test</Button>
                    <Button variant="secondary" onClick={() => setShowCreateTest(false)}>
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tests.map((test) => (
                  <Card key={test.id}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{test.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{test.description}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Type: {test.type}</span>
                          <span>Duration: {test.totalDuration}min</span>
                          <span>Questions: {test.totalQuestions}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        test.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {test.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="secondary" className="text-sm">
                        Assign to Students
                      </Button>
                      <Button variant="secondary" className="text-sm">
                        Edit Test
                      </Button>
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
              
              <div className="space-y-4">
                {results
                  .filter(result => {
                    const test = tests.find(t => t.id === result.testId)
                    return test && test.createdBy === user?.id
                  })
                  .map((result) => {
                    const student = students.find(s => s.id === result.userId)
                    const test = tests.find(t => t.id === result.testId)
                    
                    return (
                      <Card key={result.id}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{student?.name}</h3>
                            <p className="text-sm text-gray-600">{test?.title}</p>
                            <div className="flex gap-4 text-xs text-gray-500 mt-1">
                              <span>Status: {result.status}</span>
                              {result.scores?.overall && (
                                <span>Score: {result.scores.overall}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {result.status === 'completed' && !result.confirmedBy && (
                              <Button className="text-sm">
                                Confirm Result
                              </Button>
                            )}
                            <Button variant="secondary" className="text-sm">
                              View Details
                            </Button>
                          </div>
                        </div>
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

