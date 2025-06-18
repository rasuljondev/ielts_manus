import type { Metadata } from 'next'
import './globals.css'

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
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}

