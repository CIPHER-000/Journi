import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Key, CheckCircle, AlertCircle, Loader2, Crown } from 'lucide-react'

export default function UpgradePage() {
  const navigate = useNavigate()
  const [apiKey, setApiKey] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
  } | null>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationResult({
        isValid: false,
        message: 'Please enter your OpenAI API key'
      })
      return
    }

    setIsValidating(true)
    setValidationResult(null)

    try {
      // Mock validation for now - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate validation logic
      if (apiKey.startsWith('sk-') && apiKey.length > 20) {
        setValidationResult({
          isValid: true,
          message: 'API key is valid and ready to use!'
        })
      } else {
        setValidationResult({
          isValid: false,
          message: 'Invalid API key format. Please check your key and try again.'
        })
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: 'Failed to validate API key. Please try again.'
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleUpgrade = async () => {
    if (!validationResult?.isValid) {
      return
    }

    setIsUpgrading(true)

    try {
      // Mock upgrade process - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Redirect to dashboard or success page
      navigate('/dashboard')
    } catch (error) {
      console.error('Upgrade failed:', error)
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upgrade to Pro</h1>
            <p className="text-gray-600">Unlock unlimited journey maps with your own OpenAI API key</p>
          </div>
        </div>

        {/* Upgrade Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          {/* Plan Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <Crown className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-2">Pro Plan</h2>
            <div className="text-center">
              <span className="text-4xl font-bold">$15</span>
              <span className="text-xl opacity-90">/month</span>
            </div>
            <p className="text-center mt-2 opacity-90">Unlimited journey maps with your OpenAI API key</p>
          </div>

          {/* Features */}
          <div className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">What's included:</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Unlimited journey maps</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Priority processing</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Advanced export options</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Usage analytics</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Email support</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Your own OpenAI API key</span>
              </div>
            </div>

            {/* API Key Input */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                <Key className="w-4 h-4 inline mr-2" />
                OpenAI API Key
              </label>
              <div className="space-y-4">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={validateApiKey}
                    disabled={isValidating || !apiKey.trim()}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      'Validate Key'
                    )}
                  </button>
                </div>

                {/* Validation Result */}
                {validationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg flex items-center gap-3 ${
                      validationResult.isValid
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    {validationResult.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${
                      validationResult.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {validationResult.message}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Help Text */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">How to get your OpenAI API key:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com/api-keys</a></li>
                  <li>2. Click "Create new secret key"</li>
                  <li>3. Copy the key and paste it above</li>
                  <li>4. Make sure your OpenAI account has billing set up</li>
                </ol>
              </div>
            </div>

            {/* Upgrade Button */}
            <motion.button
              whileHover={{ scale: validationResult?.isValid ? 1.02 : 1 }}
              whileTap={{ scale: validationResult?.isValid ? 0.98 : 1 }}
              onClick={handleUpgrade}
              disabled={!validationResult?.isValid || isUpgrading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpgrading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Upgrading to Pro...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  Upgrade to Pro - $15/month
                </>
              )}
            </motion.button>

            <p className="text-center text-sm text-gray-500 mt-4">
              You can cancel anytime. No long-term commitments.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}