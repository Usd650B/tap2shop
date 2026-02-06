'use client'

import { useAuth } from '@/contexts/AuthContext'
import AuthPage from '@/components/AuthPage'
import Dashboard from '@/components/Dashboard'
import LandingPage from '@/components/LandingPage'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (user) {
    return <Dashboard />
  }

  return <LandingPage />
}
