import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Download, Share2, Users, Heart, Frown, 
  Smile, Meh, AlertCircle, CheckCircle, Star, Quote, FileText
} from 'lucide-react'

interface Persona {
  id: string
  name: string
  age: string
  occupation: string
  goals: string[]
  painPoints: string[]
  quote: string
  avatar: string
}

interface JourneyPhase {
  id: string
  name: string
  actions: string[]
  touchpoints: string[]
  emotions: 'happy' | 'neutral' | 'frustrated' | 'excited'
  painPoints: string[]
  opportunities: string[]
  customerQuote: string
}

export default function JourneyMapPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Mock data for the journey map
  const journeyMap = {
    id: id || '1',
    title: 'E-commerce Customer Journey',
    industry: 'E-commerce',
    createdAt: new Date('2024-01-15'),
    personas: [
      {
        id: '1',
        name: 'Sarah Chen',
        age: '28',
        occupation: 'Marketing Manager',
        goals: ['Find quality products quickly', 'Get good value for money', 'Easy returns process'],
        painPoints: ['Too many options', 'Unclear product descriptions', 'Slow checkout'],
        quote: "I want to find what I need quickly without getting overwhelmed by choices.",
        avatar: '👩‍💼'
      },
      {
        id: '2',
        name: 'Mike Rodriguez',
        age: '35',
        occupation: 'Software Developer',
        goals: ['Research thoroughly before buying', 'Compare prices', 'Read reviews'],
        painPoints: ['Lack of detailed specs', 'No comparison tools', 'Hidden fees'],
        quote: "I need all the technical details before I make a purchase decision.",
        avatar: '👨‍💻'
      }
    ] as Persona[],
    phases: [
      {
        id: '1',
        name: 'Awareness',
        actions: ['Sees social media ad', 'Searches Google', 'Visits website'],
        touchpoints: ['Social Media', 'Search Engine', 'Website'],
        emotions: 'neutral' as const,
        painPoints: ['Ad not relevant', 'Website loads slowly'],
        opportunities: ['Improve ad targeting', 'Optimize page speed'],
        customerQuote: "I'm curious about this product I saw online."
      },
      {
        id: '2',
        name: 'Consideration',
        actions: ['Browses products', 'Reads reviews', 'Compares options'],
        touchpoints: ['Product Pages', 'Review Section', 'Comparison Tool'],
        emotions: 'frustrated' as const,
        painPoints: ['Too many similar products', 'Confusing navigation'],
        opportunities: ['Add product filters', 'Improve categorization'],
        customerQuote: "There are so many options, I'm not sure which one is right for me."
      },
      {
        id: '3',
        name: 'Purchase',
        actions: ['Adds to cart', 'Enters payment info', 'Completes order'],
        touchpoints: ['Shopping Cart', 'Checkout Page', 'Payment Gateway'],
        emotions: 'happy' as const,
        painPoints: ['Unexpected shipping costs', 'Complex checkout'],
        opportunities: ['Show shipping costs upfront', 'Simplify checkout'],
        customerQuote: "Finally found what I wanted, hope the checkout is smooth."
      },
      {
        id: '4',
        name: 'Delivery',
        actions: ['Receives confirmation', 'Tracks package', 'Receives product'],
        touchpoints: ['Email', 'Tracking Page', 'Delivery Service'],
        emotions: 'excited' as const,
        painPoints: ['Delayed delivery', 'Poor packaging'],
        opportunities: ['Improve delivery estimates', 'Better packaging'],
        customerQuote: "Can't wait to receive my order and try it out!"
      },
      {
        id: '5',
        name: 'Usage',
        actions: ['Unboxes product', 'Sets up/uses product', 'Evaluates quality'],
        touchpoints: ['Product', 'User Manual', 'Support Docs'],
        emotions: 'happy' as const,
        painPoints: ['Complex setup', 'Missing accessories'],
        opportunities: ['Improve onboarding', 'Include all accessories'],
        customerQuote: "This product works great and was worth the purchase."
      },
      {
        id: '6',
        name: 'Advocacy',
        actions: ['Leaves review', 'Recommends to friends', 'Shares on social'],
        touchpoints: ['Review Platform', 'Social Media', 'Word of Mouth'],
        emotions: 'happy' as const,
        painPoints: ['Difficult review process', 'No incentive to share'],
        opportunities: ['Simplify review process', 'Offer referral rewards'],
        customerQuote: "I love this product and want to tell everyone about it!"
      }
    ] as JourneyPhase[]
  }

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'happy':
        return <Smile className="w-6 h-6 text-green-500" />
      case 'excited':
        return <Star className="w-6 h-6 text-yellow-500" />
      case 'neutral':
        return <Meh className="w-6 h-6 text-gray-500" />
      case 'frustrated':
        return <Frown className="w-6 h-6 text-red-500" />
      default:
        return <Meh className="w-6 h-6 text-gray-500" />
    }
  }

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy':
        return 'bg-green-100 border-green-300'
      case 'excited':
        return 'bg-yellow-100 border-yellow-300'
      case 'neutral':
        return 'bg-gray-100 border-gray-300'
      case 'frustrated':
        return 'bg-red-100 border-red-300'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  const handleExport = async (format: 'pdf' | 'png' | 'pptx' | 'json') => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'
      const response = await fetch(`${backendUrl}/api/journey/${id}/export/${format}`)
      
      if (response.ok) {
        if (format === 'json') {
          const data = await response.json()
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `journey-map-${id}.json`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `journey-map-${id}.${format}`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
        alert(`Journey map exported as ${format.toUpperCase()} successfully!`)
      } else {
        const errorText = await response.text()
        console.error('Export failed:', errorText)
        alert(`Export failed: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert(`Export failed: ${error.message}`)
    }
    
    setShowExportMenu(false)
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: journeyMap.title,
          text: `Check out this customer journey map for ${journeyMap.industry}`,
          url: shareUrl
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
        alert('Journey map URL copied to clipboard!')
      } else {
        alert(`Share this journey map: ${shareUrl}`)
      }
    } catch (error) {
      console.error('Share failed:', error)
      alert(`Share URL: ${shareUrl}`)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{journeyMap.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {journeyMap.industry}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {journeyMap.personas.length} Personas
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {journeyMap.phases.length} Phases
              </span>
              <span>Created {journeyMap.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-2">
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Export as PDF
                    </button>
                    <button
                      onClick={() => handleExport('png')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export as PNG
                    </button>
                    <button
                      onClick={() => handleExport('pptx')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Export as PowerPoint
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export as JSON
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Personas Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Customer Personas
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {journeyMap.personas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} />
          ))}
        </div>
      </div>

      {/* Journey Map */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Journey Map</h2>
        <div className="bg-gray-50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto overflow-y-hidden">
            <div className="min-w-max">
              {/* Phase Headers */}
              <div className="flex bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-gray-200">
                {journeyMap.phases.map((phase, index) => (
                  <div key={phase.id} className="flex-shrink-0 w-80 sm:w-96 p-4 sm:p-6 text-center border-r border-gray-200 last:border-r-0">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{phase.name}</h3>
                    </div>
                    <div className="flex justify-center">
                      {getEmotionIcon(phase.emotions)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Journey Details */}
              <div className="flex bg-white">
                {journeyMap.phases.map((phase) => (
                  <div key={phase.id} className={`flex-shrink-0 w-80 sm:w-96 p-4 sm:p-6 border-r border-gray-200 last:border-r-0`}>
                    <JourneyPhaseDetails phase={phase} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-friendly scroll indicator */}
        <div className="mt-4 text-center text-sm text-gray-500">
          ← Scroll horizontally to view all phases →
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Insights & Recommendations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Main Pain Points
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Complex navigation makes product discovery difficult</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Unexpected costs appear during checkout</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Lack of detailed product information</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Opportunities
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Implement smart product filtering and search</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Show all costs upfront to build trust</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Create referral program to encourage advocacy</span>
                </li>
              </ul>
            </div>
          </div>
      </div>
    </div>
  )
}

function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl">{persona.avatar}</div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{persona.name}</h3>
          <p className="text-gray-600">{persona.age} • {persona.occupation}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">Goals</h4>
        <ul className="space-y-1">
          {persona.goals.map((goal, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              {goal}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">Pain Points</h4>
        <ul className="space-y-1">
          {persona.painPoints.map((pain, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              {pain}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg">
        <div className="flex items-start gap-2">
          <Quote className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800 italic">"{persona.quote}"</p>
        </div>
      </div>
    </motion.div>
  )
}

function JourneyPhaseDetails({ phase }: { phase: JourneyPhase }) {
  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto">
      <div>
        <h4 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm uppercase tracking-wider">Actions</h4>
        <ul className="space-y-1">
          {phase.actions.map((action, index) => (
            <li key={index} className="text-xs sm:text-sm text-gray-700 flex items-start gap-2">
              <span className="text-blue-500 mt-0.5 flex-shrink-0">→</span>
              <span className="break-words">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm uppercase tracking-wider">Touchpoints</h4>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {phase.touchpoints.map((touchpoint, index) => (
            <span key={index} className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-2 sm:px-3 py-1 rounded-lg text-xs font-medium break-words">
              {touchpoint}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm uppercase tracking-wider">Pain Points</h4>
        <ul className="space-y-1">
          {phase.painPoints.map((pain, index) => (
            <li key={index} className="text-xs sm:text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
              <span className="break-words">{pain}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm uppercase tracking-wider">Opportunities</h4>
        <ul className="space-y-1">
          {phase.opportunities.map((opportunity, index) => (
            <li key={index} className="text-xs sm:text-sm text-green-700 flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
              <span className="break-words">{opportunity}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-4 rounded-xl border-l-4 border-blue-500">
        <div className="flex items-start gap-2">
          <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs sm:text-sm text-gray-800 italic font-medium break-words">"{phase.customerQuote}"</p>
        </div>
      </div>
    </div>
  )
}
