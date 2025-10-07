import { Suspense } from 'react';

export function AuthLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="max-w-md w-full mx-auto p-6">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl animate-pulse" />
        
        {/* Main form container skeleton */}
        <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Header skeleton */}
          <div className="text-center mb-8">
            <div className="h-8 bg-slate-700 rounded-lg mb-4 animate-pulse" />
            <div className="h-4 bg-slate-700 rounded mb-2 animate-pulse" />
          </div>

          {/* Role selection skeleton */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="h-24 bg-slate-700 rounded-lg animate-pulse" />
            <div className="h-24 bg-slate-700 rounded-lg animate-pulse" />
          </div>

          {/* Form fields skeleton */}
          <div className="space-y-6">
            <div>
              <div className="h-4 bg-slate-700 rounded mb-2 animate-pulse" />
              <div className="h-12 bg-slate-700 rounded-lg animate-pulse" />
            </div>
            <div>
              <div className="h-4 bg-slate-700 rounded mb-2 animate-pulse" />
              <div className="h-12 bg-slate-700 rounded-lg animate-pulse" />
            </div>
            <div>
              <div className="h-4 bg-slate-700 rounded mb-2 animate-pulse" />
              <div className="h-12 bg-slate-700 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Button skeleton */}
          <div className="mt-8">
            <div className="h-12 bg-slate-700 rounded-lg animate-pulse" />
          </div>

          {/* Footer skeleton */}
          <div className="mt-6 text-center">
            <div className="h-4 bg-slate-700 rounded mx-auto w-48 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthFormFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xl font-bold text-white">Loading...</span>
            </div>
            <p className="text-slate-400">Preparing your authentication experience</p>
          </div>
        </div>
      </div>
    </div>
  );
}