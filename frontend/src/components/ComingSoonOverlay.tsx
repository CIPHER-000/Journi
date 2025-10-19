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
      {/* Lightly dimmed content - visible as teaser */}
      <div className="pointer-events-none select-none opacity-60">
        {children}
      </div>

      {/* Coming Soon Banner - Absolute and centered */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
        role="dialog"
        aria-label="Feature coming soon"
        aria-describedby="coming-soon-description"
      >
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-500 p-6 max-w-lg mx-4 text-center">
          <div className="mb-3 flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center">
              <Construction className="w-6 h-6 text-green-600" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900">
              {message}
            </h2>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
          
          <p 
            id="coming-soon-description" 
            className="text-sm text-gray-600 mb-4"
          >
            {description}
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Feature in development</span>
          </div>
        </div>
      </div>
    </div>
  )
}
