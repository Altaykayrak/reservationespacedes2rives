
import React from 'react';
import { FallbackProps } from 'react-error-boundary';
import { Button } from '@/components/ui/button';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Une erreur est survenue</h2>
        <div className="mb-4 p-4 bg-red-50 rounded border border-red-200">
          <p className="text-red-800 font-mono text-sm whitespace-pre-wrap break-words">
            {error.message}
          </p>
        </div>
        <Button
          onClick={resetErrorBoundary}
          className="w-full"
        >
          Essayer à nouveau
        </Button>
      </div>
    </div>
  );
}
