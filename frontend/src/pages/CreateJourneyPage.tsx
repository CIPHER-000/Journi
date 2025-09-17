import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Map, Upload, X, FileText, Users, Target, Lightbulb, Loader2, ArrowLeft, AlertCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import UpgradeModal from '../components/UpgradeModal'
import JourneyProgress from '../components/JourneyProgress'
import { useAuth } from '../context/AuthContext'
import { useActiveJourney } from '../hooks/useActiveJourney'

interface FormData {
  title: string
  industry: string
  businessGoals: string
  targetPersonas: string[]
  journeyPhases: string[]
  additionalContext: string
  files: File[]
}

interface JobStatus {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress?: {
    currentStep: number
    totalSteps: number
    stepName: string
    message: string
    percentage: number
    estimatedTimeRemaining?: number
  }
  result?: any
}

export default function CreateJourneyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useAuth()
  const { hasActiveJourney, loading, refetch: refetchActiveJourney } = useActiveJourney()

  // Debug active journey state
  useEffect(() => {
    console.log('🔍 CreateJourneyPage - hasActiveJourney:', hasActiveJourney, 'loading:', loading)
  }, [hasActiveJourney, loading])

  const [formData, setFormData] = useState<FormData>({
    title: '',
    industry: '',
    businessGoals: '',
    targetPersonas: [],
    journeyPhases: [],
    additionalContext: '',
    files: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [progressMessages, setProgressMessages] = useState<string[]>([])
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [estimatedCompletion, setEstimatedCompletion] = useState<Date | null>(null)

  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [usageInfo, setUsageInfo] = useState<{
    currentUsage: number
    limit: number
  } | null>(null)

  
  // Reset state when coming from a retry
  useEffect(() => {
    if (location.state?.retry) {
      // Reset all states to initial values
      setIsSubmitting(false)
      setJobStatus(null)
      setProgressMessages([])
      setStartTime(null)
      setEstimatedCompletion(null)

      // Clear the navigation state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} })

      // Refetch active journey status
      refetchActiveJourney()

      console.log('Form reset for retry attempt')
    }
  }, [location.state, navigate, location.pathname, refetchActiveJourney])

  // Handle job completion
  const handleJobComplete = () => {
    console.log('Job completed, cleaning up...')
    setIsSubmitting(false)
    refetchActiveJourney() // Update active journey status
  }

  // Handle job cancellation
  const handleJobCancel = () => {
    console.log('Job cancelled, resetting form...')
    setIsSubmitting(false)
    setJobStatus(null)
    setProgressMessages([])
    setStartTime(null)
    setEstimatedCompletion(null)
    refetchActiveJourney() // Update active journey status
  }

  const industryOptions = [
    'Technology/SaaS', 'E-commerce/Retail', 'Healthcare', 'Financial Services', 
    'Education', 'Manufacturing', 'Real Estate', 'Travel & Hospitality',
    'Media & Entertainment', 'Automotive', 'Other'
  ]

  const personaOptions = [
    'First-time buyers', 'Returning customers', 'Enterprise clients',
    'Small business owners', 'Students', 'Professionals', 'Seniors',
    'Tech-savvy users', 'Budget-conscious shoppers', 'Premium customers'
  ]

  const phaseOptions = [
    'Awareness', 'Consideration', 'Purchase', 'Onboarding',
    'Usage', 'Support', 'Renewal', 'Advocacy'
  ]

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt']
    },
    onDrop: (acceptedFiles) => {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...acceptedFiles]
      }))
    }
  })

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }

  const toggleSelection = (value: string, field: 'targetPersonas' | 'journeyPhases') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  // Function to generate a title based on form data
  const generateJourneyTitle = (data: FormData): string => {
    const industry = data.industry || 'Customer';
    const phase = data.journeyPhases[0] ? `${data.journeyPhases[0]} ` : '';
    const persona = data.targetPersonas.length > 0 ? ` for ${data.targetPersonas[0]}` : '';
    
    return `${industry} ${phase}Journey${persona}`.replace(/\s+/g, ' ').trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 FORM SUBMITTED - Starting journey creation process')
    
    // Log form validation
    console.log('Form validation:', {
      hasIndustry: !!formData.industry,
      hasBusinessGoals: !!formData.businessGoals,
      hasPersonas: formData.targetPersonas.length > 0,
      hasPhases: formData.journeyPhases.length > 0
    })
    
    // Validate minimum requirements
    if (!formData.industry) {
      alert('Please select an industry');
      return;
    }
    if (!formData.businessGoals) {
      alert('Please enter your business goals');
      return;
    }
    if (formData.targetPersonas.length === 0) {
      alert('Please select at least one target persona');
      return;
    }
    if (formData.journeyPhases.length === 0) {
      alert('Please select at least one journey phase');
      return;
    }
    
    console.log('✅ Form validation passed')
    
    setIsSubmitting(true)
    setStartTime(new Date())
    setProgressMessages([])

    try {
      // Generate title automatically
      const generatedTitle = generateJourneyTitle(formData);
      const formDataWithTitle = { ...formData, title: generatedTitle };
      
      const formDataToSend = new FormData()
      formDataWithTitle.files.forEach(file => {
        formDataToSend.append('files', file)
      })
      
      // Add other form data
      Object.entries(formDataWithTitle).forEach(([key, value]) => {
        if (key !== 'files') {
          if (Array.isArray(value)) {
            value.forEach(item => formDataToSend.append(key, item))
          } else {
            formDataToSend.append(key, value || '')
          }
        }
      })

      const token = localStorage.getItem('auth_token')
      const headers: HeadersInit = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'}/api/journey/create`
      console.log('Sending request to:', apiUrl)
      console.log('Request headers:', JSON.stringify(headers, null, 2))
      
      // Log form data entries for debugging
      console.log('Form data entries:')
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value)
      }
      
      let response;
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: formDataToSend,
        });
        
        console.log('Response status:', response.status, response.statusText);
        
        // Clone the response to read it as text first for debugging
        const responseClone = response.clone();
        let responseData;
        try {
          responseData = await response.json();
          console.log('Response data (JSON):', responseData);
        } catch (e) {
          const responseText = await responseClone.text();
          console.log('Response is not JSON, raw text:', responseText);
          // If we get here, the response might be HTML or an error page
          if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
            console.error('Received HTML response instead of JSON. This might be a server error page.');
            throw new Error('Server returned an HTML error page. Check server logs.');
          }
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
        }
        
        // Handle non-OK responses
        if (!response.ok) {
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            data: responseData
          });
          
          // Special handling for CORS errors
          if (response.status === 0) {
            throw new Error('Network error or CORS issue. Check if the backend is running and CORS is configured correctly.');
          }
          
          // Throw with detailed error message
          const errorMessage = responseData?.detail || responseData?.message || response.statusText || 'Unknown error';
          throw new Error(`HTTP ${response.status}: ${errorMessage}`);
        }
        
        // If we get here, the response is OK and parsed as JSON
        console.log('Journey creation successful, job data:', responseData)
        
        // Handle response status codes
        if (response.status === 402) {
          // Payment required - show upgrade modal
          setUsageInfo({
            currentUsage: responseData.detail.current_usage,
            limit: responseData.detail.limit
          });
          setShowUpgradeModal(true);
          setIsSubmitting(false);
          return;
        }

        if (response.status === 429) {
          // Too many requests - user has active journey
          alert(responseData.detail || 'You already have a journey in progress. Please wait for it to complete before starting a new one.');
          setIsSubmitting(false);
          refetchActiveJourney(); // Update the active journey state
          return;
        }
        
        // Success case - start tracking the job
        const job: JobStatus = responseData
        
        setJobStatus(job)
        
        setProgressMessages(['🚀 Journey map creation started...', '🤖 Initializing AI agents...'])
        
        return
      } catch (error) {
        console.error('Error in fetch request:', error);
        
        // Check for network errors
        if (error instanceof TypeError) {
          if (error.message === 'Failed to fetch') {
            throw new Error('Cannot connect to the backend server. Please check if the backend is running and accessible.');
          }
          if (error.message.includes('NetworkError')) {
            throw new Error('Network error. Please check your internet connection and try again.');
          }
        }
        
        // Re-throw the error with more context
        const errorMessage = error instanceof Error 
          ? error.message 
          : typeof error === 'string' 
            ? error 
            : 'Unknown error';
        throw new Error(`Failed to create journey: ${errorMessage}`);
      }
      
    } catch (error: unknown) {
      console.error('Error creating journey map:', error);
      
      let errorMessage = 'Failed to create journey map';
      
      if (error instanceof Error) {
        if (error.message === 'Failed to fetch') {
          errorMessage = 'Cannot connect to backend server. Please check if the backend is deployed and accessible.';
        } else {
          errorMessage = `Failed to create journey map: ${error.message}`;
        }
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = `Failed to create journey map: ${String((error as { message: unknown }).message)}`;
      }
      
      alert(errorMessage);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Map className="w-10 h-10 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Create Journey Map</h1>
          </div>
          <p className="text-xl text-gray-600">Tell us about your business and we'll generate a comprehensive customer journey map</p>
        </div>

        {/* Progress Display */}
        {isSubmitting && jobStatus ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <JourneyProgress 
              jobId={jobStatus.id} 
              title={jobStatus.result?.title || formData.title || 'Untitled Journey'}
              onComplete={handleJobComplete}
              onCancel={handleJobCancel}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Industry Selection */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select your industry</option>
                {industryOptions.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            {/* Business Goals */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
                Business Goals
              </label>
              <textarea
                value={formData.businessGoals}
                onChange={(e) => setFormData(prev => ({ ...prev, businessGoals: e.target.value }))}
                placeholder="Describe your main business objectives and what you want to achieve..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                required
              />
            </div>

            {/* Target Personas */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Target Personas
              </label>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Type a custom persona and press Enter..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const customPersona = e.currentTarget.value.trim()
                      if (!formData.targetPersonas.includes(customPersona)) {
                        setFormData(prev => ({
                          ...prev,
                          targetPersonas: [...prev.targetPersonas, customPersona]
                        }))
                      }
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {personaOptions.map(persona => (
                  <button
                    key={persona}
                    type="button"
                    onClick={() => toggleSelection(persona, 'targetPersonas')}
                    className={`p-3 rounded-lg border-2 transition-colors text-sm ${
                      formData.targetPersonas.includes(persona)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
                  >
                    {persona}
                  </button>
                ))}
              </div>
              {/* Display custom personas */}
              {formData.targetPersonas.filter(persona => !personaOptions.includes(persona)).length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Custom personas:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.targetPersonas
                      .filter(persona => !personaOptions.includes(persona))
                      .map(persona => (
                        <span
                          key={persona}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {persona}
                          <button
                            type="button"
                            onClick={() => toggleSelection(persona, 'targetPersonas')}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Journey Phases */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                <Map className="w-5 h-5 mr-2 text-blue-600" />
                Journey Phases
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {phaseOptions.map(phase => (
                  <button
                    key={phase}
                    type="button"
                    onClick={() => toggleSelection(phase, 'journeyPhases')}
                    className={`p-3 rounded-lg border-2 transition-colors text-sm ${
                      formData.journeyPhases.includes(phase)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
                  >
                    {phase}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                <Upload className="w-5 h-5 mr-2 text-blue-600" />
                Research Files (Optional)
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  {isDragActive
                    ? 'Drop the files here...'
                    : 'Drag & drop files here, or click to select'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOCX, CSV, TXT files
                </p>
              </div>

              {/* Uploaded Files */}
              {formData.files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Context */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Additional Context (Optional)
              </label>
              <textarea
                value={formData.additionalContext}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalContext: e.target.value }))}
                placeholder="Any additional information that might help create a better journey map..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none bg-white"
              />
            </div>

            {/* Active Journey Warning */}
            {hasActiveJourney && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-yellow-800 font-medium mb-1">Active Journey in Progress</h3>
                    <p className="text-yellow-700 text-sm">
                      You already have a journey being generated. Please wait for it to complete or cancel it before starting a new one.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/journeys')}
                      className="mt-2 text-yellow-800 hover:text-yellow-900 text-sm font-medium underline"
                    >
                      View My Journeys
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <motion.button
                type="submit"
                disabled={isSubmitting || hasActiveJourney}
                whileHover={{ scale: (isSubmitting || hasActiveJourney) ? 1 : 1.05 }}
                whileTap={{ scale: (isSubmitting || hasActiveJourney) ? 1 : 0.95 }}
                className={`px-8 py-4 rounded-lg text-lg font-medium transition-colors ${
                  isSubmitting || hasActiveJourney
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {hasActiveJourney ? 'Journey Already in Progress' :
                 isSubmitting ? 'Creating Journey Map...' : 'Generate Journey Map'}
              </motion.button>
            </div>
          </form>
          </motion.div>
        )}
      </div>
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentUsage={usageInfo?.currentUsage || 0}
        limit={usageInfo?.limit || 5}
      />
    </div>
  )
}