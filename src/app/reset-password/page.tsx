'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Card from '@/components/Card'
import InputField from '@/components/InputField'
import Button from '@/components/Button'
import PageTransition from '@/components/PageTransition'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const accessToken = searchParams.get('access_token')

  useEffect(() => {
    setMsg('')
    setError('')
  }, [accessToken])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    setError('')
    if (!password || !confirm) {
      setError('All fields are required.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (!accessToken) {
      setError('Invalid or missing reset token.')
      return
    }
    setLoading(true)
    try {
      const { error: pwErr } = await supabase.auth.updateUser({ password })
      if (pwErr) {
        setError(pwErr.message)
        return
      }
      setMsg('Password reset successfully! You can now log in with your new password.')
      setPassword('')
      setConfirm('')
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>
            <form onSubmit={handleReset} className="space-y-4">
              <InputField
                label="New Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <InputField
                label="Confirm New Password"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
              {msg && <div className="text-green-600 text-sm text-center">{msg}</div>}
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            </form>
          </motion.div>
        </Card>
      </div>
    </PageTransition>
  )
} 