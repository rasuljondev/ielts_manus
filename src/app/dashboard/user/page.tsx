'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageTransition from '@/components/PageTransition'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Assignment {
  id: string
  testId: string
  userId: string
  assignedBy: string
  assignedAt: string
  dueDate: string
  status: string
  resultId?: string
}

interface Test {
  id: string
  title: string
  description: string
  type: string
  totalDuration: number
  totalQuestions: number
}

interface Result {
  id: string
  userId: string
  testId: string
  status: string
  startedAt?: string
  completedAt?: string
  scores?: {
    reading?: number
    listening?: number
    writing?: number
    overall?: number
  }
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [tests, setTests] = useState<Test[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'user') {
      router.push('/login')
      return
    }

    setUser(parsedUser)
    loadData(parsedUser.email)
  }, [router])

  const loadData = async (userEmail: string) => {
    try {
      // Load mock data
      const [usersRes, assignmentsRes, testsRes, resultsRes] = await Promise.all([
        fetch('/data/users.json'),
        fetch('/data/assignments.json'),
        fetch('/data/tests.json'),
        fetch('/data/results.json')
      ])

      const users = await usersRes.json()
      const allAssignments = await assignmentsRes.json()
      const allTests = await testsRes.json()
      const allResults = await resultsRes.json()

      // Find current user
      const currentUser = users.find((u: User) => u.email === userEmail)
      if (!currentUser) return

      // Filter assignments for current user
      const userAssignments = allAssignments.filter((a: Assignment) => a.userId === currentUser.id)
      
      // Get test details for assignments
      const assignmentTestIds = userAssignments.map((a: Assignment) => a.testId)
      const userTests = allTests.filter((t: Test) => assignmentTestIds.includes(t.id))
      
      // Get results for current user
      const userResults = allResults.filter((r: Result) => r.userId === currentUser.id)

      setAssignments(userAssignments)
      setTests(userTests)
      setResults(userResults)
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

  const getTestStatus = (assignment: Assignment) => {
    const result = results.find(r => r.id === assignment.resultId)
    if (!result) return 'not_started'
    return result.status
  }

  const getTestScore = (assignment: Assignment) => {
    const result = results.find(r => r.id === assignment.resultId)
    return result?.scores?.overall || null
  }

  const handleStartTest = (testId: string) => {
    router.push(`/test/start/${testId}`)
  }

  const handleViewResult = (resultId: string) => {
    router.push(`/test/result/${resultId}`)
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
              <h1 className="text-3xl font-bold text-gradient">Student Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
            </div>
            <Button onClick={handleLogout} variant="secondary">
              Logout
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assigned Tests */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">My Tests</h2>
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const test = tests.find(t => t.id === assignment.testId)
                const status = getTestStatus(assignment)
                const score = getTestScore(assignment)
                
                if (!test) return null

                return (
                  <Card key={assignment.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{test.title}</h3>
                        <p className="text-gray-600 mb-2">{test.description}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Duration: {test.totalDuration} min</span>
                          <span>Questions: {test.totalQuestions}</span>
                          <span>Type: {test.type}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          status === 'completed' ? 'bg-green-100 text-green-800' :
                          status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {status === 'completed' ? 'Completed' :
                           status === 'in_progress' ? 'In Progress' :
                           'Not Started'}
                        </div>
                        {score && (
                          <div className="mt-2 text-lg font-bold text-primary-600">
                            Score: {score}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      {status === 'not_started' && (
                        <Button onClick={() => handleStartTest(test.id)}>
                          Start Test
                        </Button>
                      )}
                      {status === 'in_progress' && (
                        <Button onClick={() => handleStartTest(test.id)}>
                          Resume Test
                        </Button>
                      )}
                      {status === 'completed' && assignment.resultId && (
                        <Button 
                          onClick={() => handleViewResult(assignment.resultId!)}
                          variant="secondary"
                        >
                          View Results
                        </Button>
                      )}
                    </div>
                  </Card>
                )
              })}
              
              {assignments.length === 0 && (
                <Card className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold mb-2">No Tests Assigned</h3>
                  <p className="text-gray-600">Your instructor will assign tests for you to complete.</p>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Overview */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tests Completed:</span>
                  <span className="font-semibold">
                    {results.filter(r => r.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tests In Progress:</span>
                  <span className="font-semibold">
                    {results.filter(r => r.status === 'in_progress').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Score:</span>
                  <span className="font-semibold">
                    {results.filter(r => r.scores?.overall).length > 0 
                      ? (results
                          .filter(r => r.scores?.overall)
                          .reduce((sum, r) => sum + (r.scores?.overall || 0), 0) / 
                         results.filter(r => r.scores?.overall).length
                        ).toFixed(1)
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {results
                  .filter(r => r.completedAt)
                  .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
                  .slice(0, 3)
                  .map((result) => {
                    const test = tests.find(t => t.id === result.testId)
                    return (
                      <div key={result.id} className="border-l-4 border-primary-500 pl-3">
                        <div className="font-medium">{test?.title}</div>
                        <div className="text-sm text-gray-600">
                          Score: {result.scores?.overall} | {new Date(result.completedAt!).toLocaleDateString()}
                        </div>
                      </div>
                    )
                  })}
                {results.filter(r => r.completedAt).length === 0 && (
                  <p className="text-gray-500 text-sm">No completed tests yet</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

