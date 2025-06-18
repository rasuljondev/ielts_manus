'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageTransition from '@/components/PageTransition'

interface Result {
  id: string
  userId: string
  testId: string
  status: string
  startedAt: string
  completedAt?: string
  scores?: {
    reading?: number
    listening?: number
    writing?: number
    overall?: number
  }
  sectionResults?: {
    reading?: {
      correctAnswers: number
      totalQuestions: number
      timeSpent: number
    }
    listening?: {
      correctAnswers: number
      totalQuestions: number
      timeSpent: number
    }
    writing?: {
      task1Score: number
      task2Score: number
      timeSpent: number
    }
  }
  feedback?: string
  confirmedBy?: string
}

interface Test {
  id: string
  title: string
  description: string
  type: string
  sections: Array<{
    id: string
    name: string
    duration: number
    questions: number
  }>
}

export default function TestResultPage() {
  const params = useParams()
  const router = useRouter()
  const resultId = params.testId as string // Using testId param for result lookup

  const [result, setResult] = useState<Result | null>(null)
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResultData()
  }, [resultId])

  const loadResultData = async () => {
    try {
      const [resultsRes, testsRes] = await Promise.all([
        fetch('/data/results.json'),
        fetch('/data/tests.json')
      ])

      const results = await resultsRes.json()
      const tests = await testsRes.json()

      // For demo purposes, find result by testId (in real app, would use resultId)
      const currentResult = results.find((r: Result) => r.testId === resultId && r.status === 'completed')
      
      if (!currentResult) {
        router.push('/dashboard/user')
        return
      }

      const currentTest = tests.find((t: Test) => t.id === currentResult.testId)

      setResult(currentResult)
      setTest(currentTest)
    } catch (error) {
      console.error('Error loading result data:', error)
      router.push('/dashboard/user')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6.5) return 'text-blue-600'
    if (score >= 5.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6.5) return 'Good'
    if (score >= 5.5) return 'Satisfactory'
    return 'Needs Improvement'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!result || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-xl font-bold mb-4">Result Not Found</h2>
          <Button onClick={() => router.push('/dashboard/user')}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              onClick={() => router.push('/dashboard/user')} 
              variant="secondary"
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gradient mb-2">Test Results</h1>
            <p className="text-gray-600">{test.title}</p>
          </div>

          {/* Overall Score */}
          <Card className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <h2 className="text-2xl font-bold mb-4">Overall Score</h2>
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.scores?.overall || 0)}`}>
                {result.scores?.overall || 'N/A'}
              </div>
              <div className={`text-lg font-medium ${getScoreColor(result.scores?.overall || 0)}`}>
                {result.scores?.overall ? getScoreLabel(result.scores.overall) : ''}
              </div>
              <div className="text-sm text-gray-500 mt-4">
                Completed on {new Date(result.completedAt!).toLocaleDateString()}
              </div>
            </motion.div>
          </Card>

          {/* Section Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {test.sections.map((section) => {
              const sectionScore = result.scores?.[section.id as keyof typeof result.scores] as number
              const sectionResult = result.sectionResults?.[section.id as keyof typeof result.sectionResults] as any

              return (
                <Card key={section.id}>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-3 capitalize">{section.name}</h3>
                    
                    {sectionScore && (
                      <>
                        <div className={`text-3xl font-bold mb-2 ${getScoreColor(sectionScore)}`}>
                          {sectionScore}
                        </div>
                        <div className={`text-sm font-medium mb-4 ${getScoreColor(sectionScore)}`}>
                          {getScoreLabel(sectionScore)}
                        </div>
                      </>
                    )}

                    {sectionResult && (
                      <div className="space-y-2 text-sm text-gray-600">
                        {section.id === 'writing' ? (
                          <>
                            <div className="flex justify-between">
                              <span>Task 1:</span>
                              <span className="font-medium">{sectionResult.task1Score}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Task 2:</span>
                              <span className="font-medium">{sectionResult.task2Score}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between">
                            <span>Correct:</span>
                            <span className="font-medium">
                              {sectionResult.correctAnswers}/{sectionResult.totalQuestions}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Time:</span>
                          <span className="font-medium">{sectionResult.timeSpent} min</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Performance Analysis */}
          <Card className="mb-8">
            <h3 className="text-xl font-bold mb-4">Performance Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Strengths</h4>
                <div className="space-y-2">
                  {result.scores?.listening && result.scores.listening >= 7 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <span>✓</span>
                      <span>Strong listening comprehension</span>
                    </div>
                  )}
                  {result.scores?.reading && result.scores.reading >= 7 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <span>✓</span>
                      <span>Excellent reading skills</span>
                    </div>
                  )}
                  {result.scores?.writing && result.scores.writing >= 7 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <span>✓</span>
                      <span>Good writing ability</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Areas for Improvement</h4>
                <div className="space-y-2">
                  {result.scores?.listening && result.scores.listening < 6.5 && (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <span>!</span>
                      <span>Focus on listening practice</span>
                    </div>
                  )}
                  {result.scores?.reading && result.scores.reading < 6.5 && (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <span>!</span>
                      <span>Improve reading speed and comprehension</span>
                    </div>
                  )}
                  {result.scores?.writing && result.scores.writing < 6.5 && (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <span>!</span>
                      <span>Practice writing structure and vocabulary</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Instructor Feedback */}
          {result.feedback && (
            <Card className="mb-8">
              <h3 className="text-xl font-bold mb-4">Instructor Feedback</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700">{result.feedback}</p>
                {result.confirmedBy && (
                  <p className="text-sm text-gray-500 mt-2">
                    Reviewed by instructor on {new Date(result.completedAt!).toLocaleDateString()}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Score Breakdown Chart */}
          <Card className="mb-8">
            <h3 className="text-xl font-bold mb-4">Score Breakdown</h3>
            <div className="space-y-4">
              {test.sections.map((section) => {
                const sectionScore = result.scores?.[section.id as keyof typeof result.scores] as number
                if (!sectionScore) return null

                return (
                  <div key={section.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">{section.name}</span>
                      <span className={`font-bold ${getScoreColor(sectionScore)}`}>
                        {sectionScore}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          sectionScore >= 8 ? 'bg-green-500' :
                          sectionScore >= 6.5 ? 'bg-blue-500' :
                          sectionScore >= 5.5 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(sectionScore / 9) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/dashboard/user')}>
              Back to Dashboard
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              Print Results
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

