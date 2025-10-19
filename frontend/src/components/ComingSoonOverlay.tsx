import React from 'react'
import { Construction, Sparkles } from 'lucide-react'

interface ComingSoonOverlayProps {
  children: React.ReactNode
  message?: string
  description?: string
}

export function ComingSoonOverlay({ 
  children, 
  message = "Coming Soon",
  description = "We're working hard to bring you this feature. Stay tuned!"
}: ComingSoonOverlayProps) {
  return (
    <div className="relative">
      {/* Greyed out content */}
      <div className="pointer-events-none select-none opacity-40 grayscale blur-[1px]">
        {children}
      </div>

      {/* Coming Soon Overlay */}
      <div 
        className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-50"
        role="dialog"
        aria-label="Feature coming soon"
        aria-describedby="coming-soon-description"
      >
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-8 max-w-md mx-4 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center">
              <Construction className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              {message}
            </h2>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
          
          <p 
            id="coming-soon-description" 
            className="text-gray-600 mb-6"
          >
            {description}
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Feature in development</span>
            </div>
            
            <p className="text-xs text-gray-400">
              This page will be available in an upcoming release
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
