import { Suspense } from 'react'
import VerifyEmailContent from './VerifyEmailContent'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-foreground/5 py-8">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-foreground/70">Loading verification...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}