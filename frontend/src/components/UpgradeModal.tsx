import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Crown, ArrowRight, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentUsage: number
  limit: number
}

export default function UpgradeModal({ isOpen, onClose, currentUsage, limit }: UpgradeModalProps) {
  const navigate = useNavigate()

  const handleUpgrade = () => {
    onClose()
    navigate('/upgrade')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Upgrade to Pro</h2>
                  <p className="text-blue-100">You've used all {limit} free journeys</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Usage Stats */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Journey Usage</span>
                    <span className="text-sm font-medium text-gray-900">{currentUsage}/{limit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Pro Benefits */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Unlock Pro features:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Unlimited journey maps</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Use your own OpenAI API key</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Priority processing</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Advanced export options</span>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-1">$15<span className="text-lg text-gray-600">/month</span></div>
                  <p className="text-sm text-gray-600">Cancel anytime</p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpgrade}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Crown className="w-5 h-5" />
                    Upgrade to Pro
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                  
                  <button
                    onClick={onClose}
                    className="w-full text-gray-600 hover:text-gray-900 py-2 px-6 rounded-xl font-medium transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}