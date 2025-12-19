import { Suspense } from 'react';
import VerifyClient from './VerifyClient';

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        Verifying payment...
      </div>
    }>
      <VerifyClient />
    </Suspense>
  );
}