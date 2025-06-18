'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageTransition from '@/components/PageTransition'

interface Question {
  id: string
  testId: string
  section: string
  type: string
  question: string
  options?: string[]
  correctAnswer?: number | string
  passage?: string
  minWords?: number
  chartData?: any
}

interface Test {
  id: string
  title: string
  description: string
  sections: Array<{
    id: string
    name: string
    duration: number
    questions: number
  }>
}

interface TestSession {
  testId: string
  currentSection: number
  currentQuestion: number
  answers: Record<string, any>
  timeRemaining: Record<string, number>
  startedAt: string
}

export default function TestStartPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.testId as string

  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [session, setSession] = useState<TestSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState<any>('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showReview, setShowReview] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTestData()
  }, [testId])

  useEffect(() => {
    if (session && !showReview) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [session, showReview])

  const loadTestData = async () => {
    try {
      const [testsRes, questionsRes] = await Promise.all([
        fetch('/data/tests.json'),
        fetch('/data/questions.json')
      ])

      const tests = await testsRes.json()
      const allQuestions = await questionsRes.json()

      const currentTest = tests.find((t: Test) => t.id === testId)
      const testQuestions = allQuestions.filter((q: Question) => q.testId === testId)

      if (!currentTest) {
        router.push('/dashboard/user')
        return
      }

      setTest(currentTest)
      setQuestions(testQuestions)

      // Load or create session
      const savedSession = localStorage.getItem(`test_session_${testId}`)
      if (savedSession) {
        const parsedSession = JSON.parse(savedSession)
        setSession(parsedSession)
        setTimeRemaining(parsedSession.timeRemaining[currentTest.sections[parsedSession.currentSection].id] || 0)
        loadCurrentQuestion(testQuestions, parsedSession)
      } else {
        // Create new session
        const newSession: TestSession = {
          testId,
          currentSection: 0,
          currentQuestion: 0,
          answers: {},
          timeRemaining: currentTest.sections.reduce((acc, section) => {
            acc[section.id] = section.duration * 60
            return acc
          }, {} as Record<string, number>),
          startedAt: new Date().toISOString()
        }
        setSession(newSession)
        setTimeRemaining(newSession.timeRemaining[currentTest.sections[0].id])
        localStorage.setItem(`test_session_${testId}`, JSON.stringify(newSession))
        loadCurrentQuestion(testQuestions, newSession)
      }
    } catch (error) {
      console.error('Error loading test data:', error)
      router.push('/dashboard/user')
    } finally {
      setLoading(false)
    }
  }

  const loadCurrentQuestion = (testQuestions: Question[], currentSession: TestSession) => {
    if (!test) return

    const currentSection = test.sections[currentSession.currentSection]
    const sectionQuestions = testQuestions.filter(q => q.section === currentSection.id)
    const question = sectionQuestions[currentSession.currentQuestion]

    if (question) {
      setCurrentQuestion(question)
      setAnswer(currentSession.answers[question.id] || '')
    }
  }

  const handleAnswerChange = (value: any) => {
    setAnswer(value)
    if (session && currentQuestion) {
      const updatedSession = {
        ...session,
        answers: { ...session.answers, [currentQuestion.id]: value }
      }
      setSession(updatedSession)
      localStorage.setItem(`test_session_${testId}`, JSON.stringify(updatedSession))
    }
  }

  const handleNextQuestion = () => {
    if (!session || !test || !currentQuestion) return

    const currentSection = test.sections[session.currentSection]
    const sectionQuestions = questions.filter(q => q.section === currentSection.id)

    if (session.currentQuestion < sectionQuestions.length - 1) {
      // Next question in same section
      const updatedSession = {
        ...session,
        currentQuestion: session.currentQuestion + 1
      }
      setSession(updatedSession)
      localStorage.setItem(`test_session_${testId}`, JSON.stringify(updatedSession))
      loadCurrentQuestion(questions, updatedSession)
    } else if (session.currentSection < test.sections.length - 1) {
      // Next section
      const updatedSession = {
        ...session,
        currentSection: session.currentSection + 1,
        currentQuestion: 0
      }
      setSession(updatedSession)
      setTimeRemaining(updatedSession.timeRemaining[test.sections[updatedSession.currentSection].id])
      localStorage.setItem(`test_session_${testId}`, JSON.stringify(updatedSession))
      loadCurrentQuestion(questions, updatedSession)
    } else {
      // Test completed
      setShowReview(true)
    }
  }

  const handlePreviousQuestion = () => {
    if (!session || !test) return

    if (session.currentQuestion > 0) {
      const updatedSession = {
        ...session,
        currentQuestion: session.currentQuestion - 1
      }
      setSession(updatedSession)
      localStorage.setItem(`test_session_${testId}`, JSON.stringify(updatedSession))
      loadCurrentQuestion(questions, updatedSession)
    }
  }

  const handleSubmitTest = () => {
    if (confirm('Are you sure you want to submit your test? This action cannot be undone.')) {
      localStorage.removeItem(`test_session_${testId}`)
      router.push(`/test/result/${testId}`)
    }
  }

  const handleAutoSubmit = () => {
    localStorage.removeItem(`test_session_${testId}`)
    alert('Time is up! Your test has been automatically submitted.')
    router.push(`/test/result/${testId}`)
  }

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!test || !session || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-xl font-bold mb-4">Test Not Found</h2>
          <Button onClick={() => router.push('/dashboard/user')}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  if (showReview) {
    return (
      <PageTransition>
        <div className="min-h-screen p-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <h2 className="text-2xl font-bold mb-6">Review Your Answers</h2>
              
              <div className="space-y-4 mb-8">
                {test.sections.map((section) => {
                  const sectionQuestions = questions.filter(q => q.section === section.id)
                  const answeredCount = sectionQuestions.filter(q => session.answers[q.id]).length
                  
                  return (
                    <div key={section.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{section.name}</h3>
                      <div className="text-sm text-gray-600">
                        Answered: {answeredCount} / {sectionQuestions.length}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${(answeredCount / sectionQuestions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={() => setShowReview(false)} variant="secondary">
                  Continue Test
                </Button>
                <Button onClick={handleSubmitTest}>
                  Submit Test
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </PageTransition>
    )
  }

  const currentSection = test.sections[session.currentSection]
  const sectionQuestions = questions.filter(q => q.section === currentSection.id)
  const questionNumber = session.currentQuestion + 1
  const totalQuestions = sectionQuestions.length

  return (
    <div className={`min-h-screen ${isFullscreen ? 'bg-white' : ''}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{test.title}</h1>
            <p className="text-sm text-gray-600">
              {currentSection.name} - Question {questionNumber} of {totalQuestions}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`text-lg font-mono ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-700'}`}>
              {formatTime(timeRemaining)}
            </div>
            {!isFullscreen && (
              <Button onClick={enterFullscreen} variant="secondary" className="text-sm">
                Fullscreen
              </Button>
            )}
            <Button onClick={() => setShowReview(true)} variant="secondary" className="text-sm">
              Review
            </Button>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-6">
                {/* Passage (if exists) */}
                {currentQuestion.passage && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-3">Reading Passage</h3>
                    <div className="text-sm leading-relaxed">
                      {currentQuestion.passage}
                    </div>
                  </div>
                )}

                {/* Question */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Question {questionNumber}: {currentQuestion.question}
                  </h3>

                  {/* Multiple Choice */}
                  {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <label key={index} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name={`question_${currentQuestion.id}`}
                            value={index}
                            checked={answer === index}
                            onChange={(e) => handleAnswerChange(parseInt(e.target.value))}
                            className="text-primary-500"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* True/False/Not Given */}
                  {currentQuestion.type === 'true_false_not_given' && (
                    <div className="space-y-3">
                      {['True', 'False', 'Not Given'].map((option, index) => (
                        <label key={index} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name={`question_${currentQuestion.id}`}
                            value={index}
                            checked={answer === index}
                            onChange={(e) => handleAnswerChange(parseInt(e.target.value))}
                            className="text-primary-500"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Fill in the Blank */}
                  {currentQuestion.type === 'fill_in_blank' && (
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder="Enter your answer"
                      className="input-field max-w-md"
                    />
                  )}

                  {/* Writing Tasks */}
                  {(currentQuestion.type === 'task1' || currentQuestion.type === 'task2') && (
                    <div>
                      {currentQuestion.minWords && (
                        <p className="text-sm text-gray-600 mb-3">
                          Minimum words: {currentQuestion.minWords}
                        </p>
                      )}
                      <textarea
                        value={answer}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        placeholder="Write your response here..."
                        rows={15}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <div className="text-sm text-gray-500 mt-2">
                        Word count: {answer.split(' ').filter((word: string) => word.length > 0).length}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              onClick={handlePreviousQuestion}
              variant="secondary"
              disabled={session.currentQuestion === 0 && session.currentSection === 0}
            >
              Previous
            </Button>

            <div className="text-sm text-gray-600">
              Section {session.currentSection + 1} of {test.sections.length}
            </div>

            <Button onClick={handleNextQuestion}>
              {session.currentQuestion === totalQuestions - 1 && session.currentSection === test.sections.length - 1
                ? 'Finish Test'
                : 'Next'
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

