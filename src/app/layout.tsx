import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'IELTS Platform - Mock Exam System',
  description: 'A comprehensive IELTS mock exam platform for students, educators, and administrators',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>
          <div className="min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

