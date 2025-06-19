'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/Button'
import InputField from '@/components/InputField'
import Card from '@/components/Card'
import PageTransition from '@/components/PageTransition'
import ProtectedRoute from '@/components/ProtectedRoute'
import { userService, centerService } from '@/lib/database'
import type { User, EducationCenter } from '@/lib/supabase'

export default function EduAdminManagementPage() {
  const [eduAdmins, setEduAdmins] = useState<User[]>([])
  const [centers, setCenters] = useState<EducationCenter[]>([])
  const [adminEmails, setAdminEmails] = useState<{[key: string]: string}>({}) // Store emails by center_id
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    centerName: '',
    centerLocation: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadData = async () => {
    try {
      setIsLoading(true) // Set loading at the start
      setError('') // Clear any previous errors

      // Fetch users with emails from the API
      const usersRes = await fetch('/api/users-with-emails')
      if (!usersRes.ok) {
        throw new Error('Failed to fetch users data')
      }
      const usersData = await usersRes.json()

      const [centersData] = await Promise.all([
        centerService.getAllCenters()
      ])
      
      // Filter only eduadmins
      const eduAdminsOnly = usersData.filter((user: any) => user.role === 'eduadmin')
      
      // Create email mapping
      const emailMap = eduAdminsOnly.reduce((acc: any, admin: any) => {
        if (admin.center_id) {
          acc[admin.center_id] = admin.email
        }
        return acc
      }, {})

      setEduAdmins(eduAdminsOnly)
      setAdminEmails(emailMap)
      setCenters(centersData)
    } catch (error: any) {
      console.error('Error loading data:', error)
      setError(error.message || 'Failed to load data')
      // Set empty states to prevent undefined errors
      setEduAdmins([])
      setAdminEmails({})
      setCenters([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, []) // Empty dependency array to only run once on mount

  const handleCreateEducationCenter = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Create education center and EduAdmin account
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          centerName: formData.centerName,
          centerLocation: formData.centerLocation
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create education center')
      }

      setSuccess('Education center and EduAdmin account created successfully!')
      setShowCreateForm(false)
      setFormData({ email: '', password: '', centerName: '', centerLocation: '' })
      
      // Store the email for display
      if (result.center && result.email) {
        setAdminEmails(prev => ({
          ...prev,
          [result.center.id]: result.email
        }))
      }
      
      loadData() // Refresh the list
    } catch (error: any) {
      console.error('Error creating education center:', error)
      setError(error.message || 'Failed to create education center')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['superadmin']}>
        <PageTransition>
          <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gradient">Education Center Management</h1>
              </div>
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            </div>
          </div>
        </PageTransition>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['superadmin']}>
      <PageTransition>
        <div className="min-h-screen p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gradient">Education Center Management</h1>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn-primary"
              >
                {showCreateForm ? 'Cancel' : 'Add Education Center'}
              </Button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600"
              >
                {error}
                <button 
                  onClick={loadData} 
                  className="ml-4 text-sm underline hover:no-underline"
                >
                  Try Again
                </button>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600"
              >
                {success}
              </motion.div>
            )}

            {/* Create Education Center Form */}
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <Card>
                  <h2 className="text-xl font-semibold mb-4">Create New Education Center</h2>
                  <form onSubmit={handleCreateEducationCenter} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Education Center Name"
                        type="text"
                        placeholder="Enter education center name"
                        value={formData.centerName}
                        onChange={(e) => handleInputChange('centerName', e.target.value)}
                        required
                      />

                      <InputField
                        label="EduAdmin Email"
                        type="email"
                        placeholder="Enter EduAdmin email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />

                      <InputField
                        label="Center Location"
                        type="text"
                        placeholder="Enter center location (e.g., London, UK)"
                        value={formData.centerLocation}
                        onChange={(e) => handleInputChange('centerLocation', e.target.value)}
                        required
                      />

                      <InputField
                        label="Temporary Password"
                        type="password"
                        placeholder="Enter temporary password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-700 mb-2">Important Notes:</h3>
                      <div className="text-sm text-blue-600 space-y-1">
                        <p>• EduAdmin will receive login credentials via email</p>
                        <p>• EduAdmin must complete their profile after first login</p>
                        <p>• Password must be at least 6 characters long</p>
                        <p>• Email will be auto-confirmed for immediate access</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary"
                      >
                        {isLoading ? 'Creating...' : 'Create Education Center'}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* Education Centers List */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Current Education Centers</h2>
              {centers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No education centers found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold">Center Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Location</th>
                        <th className="text-left py-3 px-4 font-semibold">EduAdmin Email</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {centers.map((center) => {
                        const eduAdmin = eduAdmins.find(admin => admin.center_id === center.id)
                        const email = adminEmails[center.id]
                        return (
                          <tr key={center.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{center.name}</td>
                            <td className="py-3 px-4">{center.location}</td>
                            <td className="py-3 px-4">
                              {eduAdmin ? (
                                <span className="text-blue-600 font-medium">
                                  {email}
                                </span>
                              ) : 'Not assigned'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                eduAdmin ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {eduAdmin ? 'Active' : 'Pending'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {new Date(center.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
} 