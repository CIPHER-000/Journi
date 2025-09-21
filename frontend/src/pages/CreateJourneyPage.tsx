import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Map, Upload, X, FileText, Users, Target, Lightbulb, Loader2,
  CheckCircle, AlertCircle, Building2, UserCircle, Plus, Minus, Zap
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'

interface FormData {
  title: string
  industry: string
  businessGoals: string
  targetPersonas: string[]
  journeyPhases: string[]
  additionalContext: string
  files: File[]
}

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Retail', 'Education',
  'Manufacturing', 'Real Estate', 'Hospitality', 'Transportation', 'Other'
]

const personaSuggestions = [
  'Customer', 'User', 'Patient', 'Student', 'Client',
  'Employee', 'Partner', 'Supplier', 'Investor', 'Regulator'
]

const phaseSuggestions = [
  'Awareness', 'Consideration', 'Decision', 'Purchase', 'Onboarding',
  'Usage', 'Support', 'Renewal', 'Advocacy', 'Feedback'
]

export default function CreateJourneyPage() {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    title: '',
    industry: '',
    businessGoals: '',
    targetPersonas: [''],
    journeyPhases: [''],
    additionalContext: '',
    files: []
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...acceptedFiles]
      }))
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md']
    },
    multiple: true
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePersonaChange = (index: number, value: string) => {
    const newPersonas = [...formData.targetPersonas]
    newPersonas[index] = value
    setFormData(prev => ({ ...prev, targetPersonas: newPersonas }))
  }

  const addPersona = () => {
    setFormData(prev => ({ ...prev, targetPersonas: [...prev.targetPersonas, ''] }))
  }

  const removePersona = (index: number) => {
    const newPersonas = formData.targetPersonas.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, targetPersonas: newPersonas }))
  }

  const handlePhaseChange = (index: number, value: string) => {
    const newPhases = [...formData.journeyPhases]
    newPhases[index] = value
    setFormData(prev => ({ ...prev, journeyPhases: newPhases }))
  }

  const addPhase = () => {
    setFormData(prev => ({ ...prev, journeyPhases: [...prev.journeyPhases, ''] }))
  }

  const removePhase = (index: number) => {
    const newPhases = formData.journeyPhases.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, journeyPhases: newPhases }))
  }

  const removeFile = (index: number) => {
    const newFiles = formData.files.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, files: newFiles }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!user || !token) {
        throw new Error('Please sign in to create a journey')
      }

      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required')
      }
      if (!formData.industry) {
        throw new Error('Industry is required')
      }
      if (!formData.businessGoals.trim()) {
        throw new Error('Business goals are required')
      }

      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('industry', formData.industry)
      formDataToSend.append('business_goals', formData.businessGoals)
      formDataToSend.append('target_personas', JSON.stringify(formData.targetPersonas.filter(p => p.trim())))
      formDataToSend.append('journey_phases', JSON.stringify(formData.journeyPhases.filter(p => p.trim())))
      formDataToSend.append('additional_context', formData.additionalContext)

      formData.files.forEach((file, index) => {
        formDataToSend.append(`files`, file)
      })

      const response = await fetch(`${API_BASE_URL}/journey/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create journey')
      }

      const result = await response.json()
      setSuccess(true)

      // Redirect to dashboard after successful creation
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <Map className="h-4 w-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Create New Journey</h1>
            <p className="text-gray-600 mt-1">Define your customer journey mapping project</p>
          </div>
        </div>
      </div>

      {success ? (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">Journey Created Successfully!</h3>
            <p className="text-green-700">Your journey is being processed. You'll be redirected to the dashboard shortly.</p>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Journey Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., E-commerce Customer Experience"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select an industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Goals *
                </label>
                <textarea
                  value={formData.businessGoals}
                  onChange={(e) => handleInputChange('businessGoals', e.target.value)}
                  placeholder="Describe your business goals for this journey mapping..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Target Personas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Target Personas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.targetPersonas.map((persona, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={persona}
                    onChange={(e) => handlePersonaChange(index, e.target.value)}
                    placeholder={`Enter persona ${index + 1}`}
                    list={`persona-suggestions-${index}`}
                  />
                  <datalist id={`persona-suggestions-${index}`}>
                    {personaSuggestions.map((suggestion) => (
                      <option key={suggestion} value={suggestion} />
                    ))}
                  </datalist>
                  {formData.targetPersonas.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePersona(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addPersona}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Persona
              </Button>
            </CardContent>
          </Card>

          {/* Journey Phases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Journey Phases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.journeyPhases.map((phase, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={phase}
                    onChange={(e) => handlePhaseChange(index, e.target.value)}
                    placeholder={`Enter journey phase ${index + 1}`}
                    list={`phase-suggestions-${index}`}
                  />
                  <datalist id={`phase-suggestions-${index}`}>
                    {phaseSuggestions.map((suggestion) => (
                      <option key={suggestion} value={suggestion} />
                    ))}
                  </datalist>
                  {formData.journeyPhases.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePhase(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addPhase}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Phase
              </Button>
            </CardContent>
          </Card>

          {/* Additional Context */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information (Optional)
                </label>
                <textarea
                  value={formData.additionalContext}
                  onChange={(e) => handleInputChange('additionalContext', e.target.value)}
                  placeholder="Any additional context or requirements for your journey..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supporting Files (Optional)
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {isDragActive
                      ? 'Drop files here'
                      : 'Drag & drop files here, or click to select files'
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports: Images, PDFs, Text files
                  </p>
                </div>

                {formData.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Attached Files:</p>
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white hover:bg-green-700 px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Journey...
                </>
              ) : (
                'Create Journey'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}