import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Search, Eye, Copy, Bookmark, Star, Users, Map, Building, ShoppingCart,
  GraduationCap, DollarSign, Smartphone, Heart, Plus, Filter
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PrimaryButton } from '../components/ui/PrimaryButton'

interface TemplatesPageProps {
  searchQuery?: string
}

interface Template {
  id: string
  name: string
  industry: string
  useCase: string
  personas: string[]
  phases: string[]
  description: string
  isPopular?: boolean
  isSaved?: boolean
  isCustom?: boolean
}

export default function TemplatesPage({ searchQuery = '' }: TemplatesPageProps) {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [industryFilter, setIndustryFilter] = useState('all')
  const [useCaseFilter, setUseCaseFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('library')

  const templates: Template[] = [
    {
      id: '1',
      name: 'SaaS Onboarding Journey',
      industry: 'SaaS',
      useCase: 'User Onboarding',
      personas: ['New User', 'Trial User', 'Free User'],
      phases: ['Awareness', 'Trial', 'Onboarding', 'Usage', 'Renewal'],
      description: 'Complete onboarding experience for SaaS platforms',
      isPopular: true,
      isSaved: false
    },
    {
      id: '2',
      name: 'E-commerce Purchase Flow',
      industry: 'E-commerce',
      useCase: 'Purchase Journey',
      personas: ['First-time Buyer', 'Returning Customer', 'Price-conscious Shopper'],
      phases: ['Discovery', 'Consideration', 'Purchase', 'Fulfillment', 'Support'],
      description: 'End-to-end purchasing experience for online retail',
      isPopular: true,
      isSaved: true
    },
    {
      id: '3',
      name: 'Financial Services Onboarding',
      industry: 'Finance',
      useCase: 'Account Opening',
      personas: ['New Customer', 'Existing Bank Customer'],
      phases: ['Research', 'Application', 'Verification', 'First Use'],
      description: 'Secure and compliant financial account setup',
      isPopular: false,
      isSaved: false
    },
    {
      id: '4',
      name: 'Educational Course Enrollment',
      industry: 'Education',
      useCase: 'Student Journey',
      personas: ['Prospective Student', 'Current Student', 'Parent'],
      phases: ['Discovery', 'Research', 'Enrollment', 'Learning', 'Completion'],
      description: 'Student experience from course discovery to completion',
      isPopular: false,
      isSaved: true
    },
    {
      id: '5',
      name: 'Mobile App First Launch',
      industry: 'Mobile',
      useCase: 'App Onboarding',
      personas: ['New User', 'Returning User'],
      phases: ['Download', 'Setup', 'First Use', 'Engagement'],
      description: 'Mobile-first onboarding and engagement flow',
      isPopular: true,
      isSaved: false
    },
    {
      id: '6',
      name: 'Healthcare Patient Portal',
      industry: 'Healthcare',
      useCase: 'Patient Experience',
      personas: ['New Patient', 'Existing Patient', 'Caregiver'],
      phases: ['Registration', 'Appointment', 'Visit', 'Follow-up'],
      description: 'Patient-centered healthcare service experience',
      isPopular: false,
      isSaved: false
    }
  ]

  const savedTemplates: Template[] = [
    {
      id: 'custom-1',
      name: 'My SaaS Onboarding (Customized)',
      industry: 'SaaS',
      useCase: 'Custom Onboarding',
      personas: ['Enterprise User', 'Team Admin'],
      phases: ['Trial', 'Demo', 'Implementation', 'Training', 'Adoption'],
      description: 'Customized template for enterprise SaaS onboarding',
      isCustom: true
    },
    {
      id: 'custom-2',
      name: 'Subscription Renewal Flow',
      industry: 'SaaS',
      useCase: 'Customer Retention',
      personas: ['Existing Customer', 'Churning Customer'],
      phases: ['Pre-renewal', 'Decision', 'Renewal', 'Upsell'],
      description: 'Custom template for subscription renewals',
      isCustom: true
    }
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(localSearchQuery.toLowerCase())
    const matchesIndustry = industryFilter === 'all' || template.industry === industryFilter
    const matchesUseCase = useCaseFilter === 'all' || template.useCase === useCaseFilter
    return matchesSearch && matchesIndustry && matchesUseCase
  })

  const industries = ['SaaS', 'E-commerce', 'Finance', 'Education', 'Mobile', 'Healthcare']
  const useCases = ['User Onboarding', 'Purchase Journey', 'Account Opening', 'Student Journey', 'App Onboarding', 'Customer Retention']

  const getIconForIndustry = (industry: string) => {
    switch (industry) {
      case 'SaaS': return Building
      case 'E-commerce': return ShoppingCart
      case 'Finance': return DollarSign
      case 'Education': return GraduationCap
      case 'Mobile': return Smartphone
      case 'Healthcare': return Heart
      default: return Map
    }
  }

  const TemplateCard = ({ template, isCustom = false }: { template: Template, isCustom?: boolean }) => {
    const IconComponent = getIconForIndustry(template.industry)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-soft transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <IconComponent className="w-5 h-5 text-green-600" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900 line-clamp-1">{template.name}</h3>
                {template.isPopular && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    Popular
                  </span>
                )}
                {isCustom && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                    Custom
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{template.industry}</span>
                <span>•</span>
                <span>{template.useCase}</span>
              </div>
            </div>
          </div>
          <button
            className={`p-1.5 rounded-lg transition-colors ${
              template.isSaved ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>

        {/* Personas */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{template.personas.length} personas</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {template.personas.slice(0, 2).map((persona) => (
              <span key={persona} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                {persona}
              </span>
            ))}
            {template.personas.length > 2 && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                +{template.personas.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Phases */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Map className="w-4 h-4" />
            <span>{template.phases.length} phases covered</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <PrimaryButton
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            <Eye className="w-3 h-3 mr-2" />
            Preview
          </PrimaryButton>
          <PrimaryButton
            size="sm"
            className="flex-1"
            onClick={() => navigate('/create', {
              state: {
                templateId: template.id,
                templateName: template.name
              }
            })}
          >
            <Copy className="w-3 h-3 mr-2" />
            Use Template
          </PrimaryButton>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
        <p className="text-lg text-gray-600">
          Start faster with ready-made journey frameworks tailored to your industry
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'library'
              ? 'border-green-600 text-green-600 bg-green-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Template Library
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'saved'
              ? 'border-green-600 text-green-600 bg-green-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          My Templates ({savedTemplates.length})
        </button>
      </div>

      {/* Search and Filters - Only show for library tab */}
      {activeTab === 'library' && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="all">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>

            <select
              value={useCaseFilter}
              onChange={(e) => setUseCaseFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="all">All Use Cases</option>
              {useCases.map(useCase => (
                <option key={useCase} value={useCase}>{useCase}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content Sections */}
      {activeTab === 'library' ? (
        <div className="space-y-8">
          {/* Popular Templates */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
              <Star className="w-5 h-5 text-yellow-500" />
              Popular Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.filter(t => t.isPopular).map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>

          {/* All Templates */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">All Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>

            {/* Empty State */}
            {filteredTemplates.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 p-12 text-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or filters to find relevant templates
                </p>
                <PrimaryButton variant="secondary" onClick={() => {
                  setLocalSearchQuery('')
                  setIndustryFilter('all')
                  setUseCaseFilter('all')
                }}>
                  Clear Filters
                </PrimaryButton>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        /* Saved Templates */
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">My Saved Templates</h2>
          {savedTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} isCustom={template.isCustom} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 p-12 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved templates yet</h3>
              <p className="text-gray-600 mb-6">
                Save templates from the library or create custom ones to see them here
              </p>
              <PrimaryButton variant="secondary" onClick={() => setActiveTab('library')}>
                Browse Template Library
              </PrimaryButton>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}