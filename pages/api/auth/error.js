import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const errors = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
}

export default function AuthError() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    const { error: errorType } = router.query
    setError(errors[errorType] || errors.Default)
  }, [router.query])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Authentication Error</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Try Again
            </button>
            <p className="text-xs text-slate-500">
              Error code: {router.query.error || 'Unknown'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}