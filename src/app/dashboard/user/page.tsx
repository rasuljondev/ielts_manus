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
import { testService, centerService, userService } from '@/lib/database'
import type { Test, EducationCenter } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { Fragment } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function UserDashboard() {
  const [tests, setTests] = useState<Test[]>([])
  const [center, setCenter] = useState<EducationCenter | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileEdit, setProfileEdit] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileError, setProfileError] = useState('')
  const [pwOld, setPwOld] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileTab, setProfileTab] = useState<'profile' | 'password'>('profile')
  const router = useRouter()
  const { profile, signOut, refreshProfile } = useAuth()

  useEffect(() => {
    if (profile) {
      setProfileName(profile.name || '')
      setProfilePhone(profile.phone || '')
      loadData()
    }
  }, [profile])

  const loadData = async () => {
    try {
      const [testsData, centerData] = await Promise.all([
        testService.getAllTests(),
        centerService.getCenterById(profile?.center_id || '')
      ])
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

  // Profile update
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMsg('')
    setProfileError('')
    if (!profileName.trim() || !profilePhone.trim()) {
      setProfileError('Name and phone are required.')
      return
    }
    try {
      await userService.updateUser(profile?.id || '', {
        name: profileName.trim(),
        phone: profilePhone.trim(),
      })
      setProfileMsg('Profile updated successfully!')
      setProfileEdit(false)
      await refreshProfile()
    } catch (error: any) {
      setProfileError(error.message || 'Failed to update profile')
    }
  }

  // Password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMsg('')
    setPwError('')
    if (!pwOld || !pwNew || !pwConfirm) {
      setPwError('All fields are required.')
      return
    }
    if (pwNew !== pwConfirm) {
      setPwError('New passwords do not match.')
      return
    }
    if (pwNew.length < 6) {
      setPwError('Password must be at least 6 characters.')
      return
    }
    try {
      // No need to re-authenticate, just update password
      const { error: pwErr } = await supabase.auth.updateUser({ password: pwNew })
      if (pwErr) {
        setPwError(pwErr.message)
        return
      }
      setPwMsg('Password changed successfully!')
      setPwOld('')
      setPwNew('')
      setPwConfirm('')
    } catch (error: any) {
      setPwError(error.message || 'Failed to change password')
    }
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
              <div className="flex items-center gap-4">
                <button
                  className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl hover:ring-2 hover:ring-blue-400 transition"
                  onClick={() => { setShowProfileModal(true); setProfileTab('profile'); }}
                  aria-label="Profile"
                  type="button"
                >
                  👤
                </button>
                <Button onClick={handleLogout} variant="secondary">
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Modal */}
          {showProfileModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative"
              >
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
                  onClick={() => setShowProfileModal(false)}
                  aria-label="Close"
                  type="button"
                >
                  &times;
                </button>
                <div className="flex gap-4 mb-6">
                  <button
                    className={`flex-1 py-2 rounded-lg font-semibold transition-all ${profileTab === 'profile' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                    onClick={() => setProfileTab('profile')}
                  >
                    Profile
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-lg font-semibold transition-all ${profileTab === 'password' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                    onClick={() => setProfileTab('password')}
                  >
                    Change Password
                  </button>
                </div>
                {profileTab === 'profile' && (
                  <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
                    <InputField
                      label="Full Name"
                      type="text"
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      required
                    />
                    <InputField
                      label="Phone Number"
                      type="tel"
                      value={profilePhone}
                      onChange={e => setProfilePhone(e.target.value)}
                      required
                    />
                    <Button type="submit" className="w-full">Save</Button>
                    {profileMsg && <div className="text-green-600 text-sm">{profileMsg}</div>}
                    {profileError && <div className="text-red-600 text-sm">{profileError}</div>}
                  </form>
                )}
                {profileTab === 'password' && (
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <InputField
                      label="Old Password"
                      type="password"
                      value={pwOld}
                      onChange={e => setPwOld(e.target.value)}
                      required
                    />
                    <InputField
                      label="New Password"
                      type="password"
                      value={pwNew}
                      onChange={e => setPwNew(e.target.value)}
                      required
                    />
                    <InputField
                      label="Confirm New Password"
                      type="password"
                      value={pwConfirm}
                      onChange={e => setPwConfirm(e.target.value)}
                      required
                    />
                    <Button type="submit" className="w-full">Change Password</Button>
                    {pwMsg && <div className="text-green-600 text-sm text-center mt-2">{pwMsg}</div>}
                    {pwError && <div className="text-red-600 text-sm text-center mt-2">{pwError}</div>}
                  </form>
                )}
                <div className="mt-6 text-center">
                  <Button variant="secondary" onClick={handleLogout} className="w-full">Logout</Button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Available Tests */}
          <div className="max-w-7xl mx-auto mb-8">
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
                          onClick={() => router.push(`/test/start/${test.id}`)}
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
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Test History</h2>
            <Card>
              <p className="text-center text-gray-500 py-8">
                Your test history will appear here after you complete tests.
              </p>
            </Card>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}

