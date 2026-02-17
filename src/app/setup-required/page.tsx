import Link from 'next/link'
import { Shield, AlertTriangle, ExternalLink } from 'lucide-react'

export default function SetupRequiredPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Setup Required
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please configure your Supabase connection to access the admin dashboard.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                🔧 Setup Steps:
              </h3>
              <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600">
                <li>
                  <strong>Create a Supabase Project</strong>
                  <br />
                  Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline">supabase.com</a>
                </li>
                <li>
                  <strong>Get Your Credentials</strong>
                  <br />
                  Go to Settings → API in your Supabase dashboard
                </li>
                <li>
                  <strong>Update Environment Variables</strong>
                  <br />
                  Create <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> with:
                </li>
              </ol>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <pre className="text-xs text-gray-700 overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                🗄️ Database Setup:
              </h3>
              <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600">
                <li>
                  Go to <strong>SQL Editor</strong> in Supabase
                </li>
                <li>
                  Run the script from <code className="bg-gray-100 px-2 py-1 rounded">database/complete_setup.sql</code>
                </li>
                <li>
                  Create your admin account with email: <code className="bg-gray-100 px-2 py-1 rounded">SHOPINPOCKETKING@shopinpocket.co.tz</code>
                </li>
              </ol>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="space-y-3">
                <Link
                  href="/"
                  className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  ← Back to Home
                </Link>
                
                <a
                  href="https://github.com/Usd650B/shopinpocket"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Setup Guide
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
