'use client'

import { useAuth } from '@/contexts/AuthContext'
import AuthPage from '@/components/AuthPage'
import Dashboard from '@/components/Dashboard'

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

function LandingPage() {
  const { signIn } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-bold text-indigo-600 font-poppins">SIP</h1>
              <span className="ml-2 text-xs text-gray-500 hidden sm:inline">Tanzania</span>
            </div>
            <button
              onClick={() => window.location.href = '#auth'}
              className="px-3 sm:px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your <span style={{ color: '#4F46E5' }}>SIP</span> Store
          </h1>
          <span className="block text-indigo-600">Made Simple</span>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto font-light">
            Create a beautiful online shop for your social media customers. 
            Connect directly with your buyers and grow your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => window.location.href = '#auth'}
              className="px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-poppins w-full sm:w-auto"
            >
              Start Your Shop
            </button>
            <button
              onClick={() => window.location.href = '#auth'}
              className="px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-poppins w-full sm:w-auto"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-8 sm:mb-12 font-poppins">
            Everything You Need to Sell Online
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 font-poppins">Create Your Shop</h3>
              <p className="text-gray-600 text-sm sm:text-base">Set up your shop in minutes with custom name, description, and unique URL</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 font-poppins">Add Products</h3>
              <p className="text-gray-600 text-sm sm:text-base">Upload products with images, prices in TZS, and detailed descriptions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 font-poppins">Manage Orders</h3>
              <p className="text-gray-600 text-sm sm:text-base">View customer orders and manage status - all in one dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-8 sm:mb-12 font-poppins">
            How SIP Works
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xs sm:text-sm">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm font-poppins">Sign Up</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Create your free account</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xs sm:text-sm">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm font-poppins">Create Shop</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Set up your shop details</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xs sm:text-sm">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm font-poppins">Add Products</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Upload your items for sale</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xs sm:text-sm">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm font-poppins">Start Selling</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Share your shop link and get orders</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-6 font-poppins">
            Ready to Start Selling?
          </h2>
          <p className="text-base sm:text-lg text-indigo-100 mb-6 sm:mb-8">
            Join thousands of Tanzanian sellers using SIP to grow their business
          </p>
          <button
            onClick={() => window.location.href = '#auth'}
            className="px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold text-indigo-600 bg-white rounded-lg hover:bg-gray-100 transition-colors font-poppins w-full sm:w-auto"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md mx-auto">
          <AuthPage />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-lg sm:text-xl font-bold text-indigo-400 mb-3 font-poppins">SIP</h3>
          <p className="text-gray-400 mb-4 text-sm sm:text-base">Your social media shop platform for Tanzania</p>
          <p className="text-gray-500 text-xs">© 2024 SIP. Made with ❤️ for Tanzanian entrepreneurs</p>
        </div>
      </footer>
    </div>
  )
}
