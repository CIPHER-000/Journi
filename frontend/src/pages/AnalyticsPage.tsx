import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Search, BookOpen, Lightbulb, X, Star, Users, BarChart3, TrendingUp,
  FileText, CheckCircle, ArrowRight, Play, Eye, Clock, LayoutTemplate, Plus
} from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../components/ui/PrimaryButton'

// Import data from Figma generated files
export const templateData = [
  {
    id: "1",
    name: "E-commerce Customer Journey",
    industry: "E-commerce",
    popularity: 1247,
    rating: 4.8,
    complexity: "Intermediate" as const,
    description: "Complete customer journey from discovery to post-purchase for online retail businesses. Includes abandoned cart recovery and retention strategies.",
    stages: [
      "Awareness & Discovery",
      "Product Research",
      "Purchase Decision",
      "Checkout Process",
      "Post-Purchase Experience",
      "Customer Retention"
    ],
    features: [
      "Multi-channel tracking",
      "Abandoned cart recovery",
      "Personalization engine",
      "Review & rating system",
      "Loyalty program integration",
      "Cross-sell recommendations"
    ],
    useCases: [
      "Online retail stores",
      "Fashion & apparel brands",
      "Electronics retailers",
      "Subscription commerce"
    ],
    benefits: [
      "25% increase in conversion",
      "40% reduction in cart abandonment",
      "30% improvement in customer lifetime value",
      "Real-time behavioral insights"
    ]
  },
  {
    id: "2",
    name: "SaaS Onboarding Flow",
    industry: "SaaS",
    popularity: 892,
    rating: 4.7,
    complexity: "Advanced" as const,
    description: "Comprehensive onboarding journey for SaaS products with progressive feature discovery and user activation milestones.",
    stages: [
      "Sign-up & Registration",
      "Email Verification",
      "Product Tour",
      "Initial Setup",
      "Feature Discovery",
      "First Value Achievement"
    ],
    features: [
      "Progressive onboarding",
      "Feature adoption tracking",
      "In-app guidance",
      "Success milestones",
      "Churn prediction",
      "Usage analytics"
    ],
    useCases: [
      "B2B SaaS platforms",
      "Productivity tools",
      "Analytics dashboards",
      "Project management apps"
    ],
    benefits: [
      "60% improvement in user activation",
      "45% reduction in time to value",
      "35% decrease in early churn",
      "Data-driven onboarding optimization"
    ]
  },
  {
    id: "3",
    name: "Healthcare Patient Experience",
    industry: "Healthcare",
    popularity: 634,
    rating: 4.9,
    complexity: "Advanced" as const,
    description: "Patient journey mapping for healthcare providers covering appointment booking, treatment, and follow-up care with compliance considerations.",
    stages: [
      "Symptom Recognition",
      "Provider Search",
      "Appointment Booking",
      "Pre-visit Preparation",
      "Clinical Visit",
      "Post-visit Care"
    ],
    features: [
      "HIPAA compliance",
      "Appointment scheduling",
      "Telehealth integration",
      "Patient portal access",
      "Care plan tracking",
      "Medication reminders"
    ],
    useCases: [
      "Primary care practices",
      "Specialty clinics",
      "Hospital systems",
      "Telehealth platforms"
    ],
    benefits: [
      "50% reduction in no-shows",
      "40% improvement in patient satisfaction",
      "30% increase in care plan adherence",
      "Streamlined provider workflows"
    ]
  },
  {
    id: "4",
    name: "FinTech User Acquisition",
    industry: "FinTech",
    popularity: 567,
    rating: 4.6,
    complexity: "Intermediate" as const,
    description: "Financial services customer acquisition journey with KYC compliance, risk assessment, and product recommendation workflows.",
    stages: [
      "Interest & Research",
      "Account Registration",
      "Identity Verification",
      "Risk Assessment",
      "Product Selection",
      "Account Activation"
    ],
    features: [
      "KYC automation",
      "Risk scoring",
      "Document verification",
      "Fraud detection",
      "Product recommendations",
      "Regulatory compliance"
    ],
    useCases: [
      "Digital banking",
      "Investment platforms",
      "Payment processors",
      "Insurance providers"
    ],
    benefits: [
      "70% faster onboarding",
      "90% reduction in fraud",
      "55% improvement in conversion",
      "Automated compliance reporting"
    ]
  },
  {
    id: "5",
    name: "Education Learning Path",
    industry: "Education",
    popularity: 423,
    rating: 4.5,
    complexity: "Beginner" as const,
    description: "Student learning journey for educational platforms with progress tracking, personalized content delivery, and assessment workflows.",
    stages: [
      "Course Discovery",
      "Enrollment Process",
      "Learning Path Setup",
      "Content Consumption",
      "Assessment & Feedback",
      "Completion & Certification"
    ],
    features: [
      "Adaptive learning",
      "Progress tracking",
      "Interactive assessments",
      "Peer collaboration",
      "Instructor feedback",
      "Certification management"
    ],
    useCases: [
      "Online course platforms",
      "Corporate training",
      "K-12 education",
      "Professional development"
    ],
    benefits: [
      "65% improvement in completion rates",
      "40% increase in engagement",
      "50% reduction in support tickets",
      "Personalized learning experiences"
    ]
  }
]

export const bestPracticesData = [
  {
    id: "1",
    title: "Customer Research Fundamentals",
    category: "Research",
    difficulty: "Beginner" as const,
    impact: "High" as const,
    readTime: 8,
    description: "Learn essential techniques for gathering customer insights through interviews, surveys, and behavioral analysis to build accurate journey maps.",
    tags: ["User Interviews", "Survey Design", "Data Analysis", "Persona Development"]
  },
  {
    id: "2",
    title: "Advanced Touchpoint Mapping",
    category: "Touchpoint Mapping",
    difficulty: "Advanced" as const,
    impact: "High" as const,
    readTime: 12,
    description: "Master the art of identifying and mapping all customer touchpoints across digital and physical channels for comprehensive journey visualization.",
    tags: ["Omnichannel", "Service Design", "Process Mapping", "Channel Strategy"]
  },
  {
    id: "3",
    title: "Journey Analytics & KPIs",
    category: "Metrics",
    difficulty: "Intermediate" as const,
    impact: "High" as const,
    readTime: 10,
    description: "Establish meaningful metrics and KPIs to measure journey performance, identify bottlenecks, and track improvement initiatives.",
    tags: ["KPIs", "Analytics", "Data Visualization", "Performance Tracking"]
  },
  {
    id: "4",
    title: "Personalization Strategies",
    category: "Personalization",
    difficulty: "Advanced" as const,
    impact: "Medium" as const,
    readTime: 15,
    description: "Implement dynamic customer journey personalization using behavioral data, preferences, and predictive analytics for enhanced experiences.",
    tags: ["AI/ML", "Behavioral Targeting", "Dynamic Content", "Predictive Analytics"]
  },
  {
    id: "5",
    title: "Cross-Functional Journey Workshops",
    category: "Collaboration",
    difficulty: "Intermediate" as const,
    impact: "High" as const,
    readTime: 6,
    description: "Facilitate effective journey mapping workshops with stakeholders from different departments to ensure comprehensive perspective and buy-in.",
    tags: ["Workshop Facilitation", "Stakeholder Management", "Team Alignment", "Change Management"]
  },
  {
    id: "6",
    title: "Journey Optimization Techniques",
    category: "Metrics",
    difficulty: "Advanced" as const,
    impact: "High" as const,
    readTime: 14,
    description: "Apply systematic approaches to identify friction points, test solutions, and continuously optimize customer journey performance.",
    tags: ["A/B Testing", "Conversion Optimization", "User Experience", "Continuous Improvement"]
  }
]

const complexityColors = {
  Beginner: "bg-green-100 text-green-800 border-green-200",
  Intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Advanced: "bg-red-100 text-red-800 border-red-200"
}

const industryColors = {
  "E-commerce": "bg-orange-50 border-orange-200",
  "SaaS": "bg-blue-50 border-blue-200",
  "Healthcare": "bg-green-50 border-green-200",
  "FinTech": "bg-purple-50 border-purple-200",
  "Education": "bg-indigo-50 border-indigo-200"
}

const categoryIcons = {
  'Research': <Search className="w-5 h-5" />,
  'Touchpoint Mapping': <LayoutTemplate className="w-5 h-5" />,
  'Metrics': <BarChart3 className="w-5 h-5" />,
  'Personalization': <Star className="w-5 h-5" />,
  'Collaboration': <Users className="w-5 h-5" />
}

interface TemplatesPageProps {
  searchQuery?: string
}

// Template Card Component
const TemplateCard: React.FC<{
  template: typeof templateData[0]
  onClick: () => void
}> = ({ template, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`bg-white border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${industryColors[template.industry as keyof typeof industryColors] || 'bg-gray-50 border-gray-200'}`}
      onClick={onClick}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{template.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${complexityColors[template.complexity]}`}>
            {template.complexity}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{template.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{template.popularity}+ uses</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            <span>{template.stages.length} stages</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>

        <div className="flex flex-wrap gap-2">
          {template.features.slice(0, 3).map((feature, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {feature}
            </span>
          ))}
          {template.features.length > 3 && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              +{template.features.length - 3} more
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Best Practice Card Component
const BestPracticeCard: React.FC<{
  practice: typeof bestPracticesData[0]
  onClick: () => void
}> = ({ practice, onClick }) => {
  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800 border-green-200",
    Intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Advanced: "bg-red-100 text-red-800 border-red-200"
  }

  const impactColors = {
    Low: "bg-gray-200",
    Medium: "bg-blue-200",
    High: "bg-green-200"
  }

  const categoryColors = {
    Research: "bg-blue-50 border-blue-200",
    "Touchpoint Mapping": "bg-purple-50 border-purple-200",
    Metrics: "bg-green-50 border-green-200",
    Personalization: "bg-orange-50 border-orange-200",
    Collaboration: "bg-indigo-50 border-indigo-200"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`bg-white border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${categoryColors[practice.category as keyof typeof categoryColors] || 'bg-gray-50 border-gray-200'}`}
      onClick={onClick}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{practice.title}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[practice.difficulty]}`}>
            {practice.difficulty}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Impact</span>
            <span className="font-medium">{practice.impact}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${impactColors[practice.impact]}`}
              style={{
                width: practice.impact === 'Low' ? '30%' :
                       practice.impact === 'Medium' ? '65%' : '90%'
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{practice.category}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{practice.readTime} min read</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">{practice.description}</p>

        <div className="flex flex-wrap gap-2">
          {practice.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
          {practice.tags.length > 3 && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              +{practice.tags.length - 3} more
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Filter Section Component
const FilterSection: React.FC<{
  selectedIndustry: string
  selectedComplexity: string
  onIndustryChange: (value: string) => void
  onComplexityChange: (value: string) => void
  onClearFilters: () => void
}> = ({ selectedIndustry, selectedComplexity, onIndustryChange, onComplexityChange, onClearFilters }) => {
  const hasActiveFilters = selectedIndustry !== "all" || selectedComplexity !== "all"

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-3">
          <select
            value={selectedIndustry}
            onChange={(e) => onIndustryChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
          >
            <option value="all">All Industries</option>
            <option value="E-commerce">E-commerce</option>
            <option value="SaaS">SaaS</option>
            <option value="Healthcare">Healthcare</option>
            <option value="FinTech">FinTech</option>
            <option value="Education">Education</option>
          </select>

          <select
            value={selectedComplexity}
            onChange={(e) => onComplexityChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
          >
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {selectedIndustry !== "all" && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                  {selectedIndustry}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onIndustryChange("all")}
                  />
                </span>
              )}
              {selectedComplexity !== "all" && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                  {selectedComplexity}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onComplexityChange("all")}
                  />
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}

// Stats Section Component
const StatsSection = () => {
  const stats = [
    {
      title: "Total Templates",
      value: templateData.length.toString(),
      icon: FileText,
      trend: "+12%"
    },
    {
      title: "Popular Templates",
      value: templateData.filter(t => t.rating >= 4.7).length.toString(),
      icon: Star,
      trend: "+23%"
    },
    {
      title: "Best Practices",
      value: bestPracticesData.length.toString(),
      icon: BookOpen,
      trend: "+15%"
    }
  ]

  const usageData = [
    { name: "E-commerce", usage: 85 },
    { name: "SaaS", usage: 72 },
    { name: "Healthcare", usage: 68 },
    { name: "FinTech", usage: 54 },
    { name: "Education", usage: 41 }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <stat.icon className="h-5 w-5 text-gray-400" />
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Usage by Industry</h3>
        <div className="space-y-3">
          {usageData.map((industry, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">{industry.name}</span>
                <span className="text-gray-600">{industry.usage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${industry.usage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Template Modal Component
const TemplateModal: React.FC<{
  open: boolean
  onOpenChange: (open: boolean) => void
  template: typeof templateData[0] | null
  onUseTemplate: (template: typeof templateData[0]) => void
}> = ({ open, onOpenChange, template, onUseTemplate }) => {
  if (!template) return null

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
                <button
                  onClick={() => onOpenChange(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{template.rating.toFixed(1)} rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{template.popularity}+ teams using</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>{template.stages.length} stages</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${complexityColors[template.complexity]}`}>
                  {template.complexity}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
                <p className="text-gray-600">{template.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Journey Stages</h3>
                <div className="grid gap-3">
                  {template.stages.map((stage, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{stage}</span>
                      {index < template.stages.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                  <div className="space-y-2">
                    {template.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Use Cases</h3>
                  <div className="space-y-2">
                    {template.useCases.map((useCase, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">{useCase}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Expected Benefits</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {template.benefits.map((benefit, index) => (
                    <span key={index} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <PrimaryButton
                  onClick={() => {
                    onUseTemplate(template)
                    onOpenChange(false)
                  }}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Use This Template
                </PrimaryButton>
                <SecondaryButton onClick={() => onOpenChange(false)}>
                  Close
                </SecondaryButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function TemplatesPage({ searchQuery = '' }: TemplatesPageProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'templates' | 'best-practices'>('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templateData[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '')
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [selectedComplexity, setSelectedComplexity] = useState('all')

  // Filter templates
  const filteredTemplates = templateData.filter(template => {
    const matchesSearch = !localSearchQuery ||
      template.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(localSearchQuery.toLowerCase())
    const matchesIndustry = selectedIndustry === 'all' || template.industry === selectedIndustry
    const matchesComplexity = selectedComplexity === 'all' || template.complexity === selectedComplexity

    return matchesSearch && matchesIndustry && matchesComplexity
  })

  // Filter best practices
  const filteredBestPractices = bestPracticesData.filter(practice => {
    const matchesSearch = !localSearchQuery ||
      practice.title.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      practice.description.toLowerCase().includes(localSearchQuery.toLowerCase())
    const matchesComplexity = selectedComplexity === 'all' || practice.difficulty === selectedComplexity

    return matchesSearch && matchesComplexity
  })

  const handleTemplateClick = (template: typeof templateData[0]) => {
    setSelectedTemplate(template)
    setIsModalOpen(true)
  }

  const handleUseTemplate = (template: typeof templateData[0]) => {
    // Navigate to create page with template data
    navigate('/create', {
      state: {
        template: template,
        fromTemplate: true
      }
    })
  }

  const handleClearFilters = () => {
    setSelectedIndustry('all')
    setSelectedComplexity('all')
    setLocalSearchQuery('')
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <LayoutTemplate className="w-8 h-8 text-indigo-600" />
              Templates & Best Practices
            </h1>
            <p className="text-gray-600 mt-1">
              Accelerate your journey creation with proven templates and expert guidance
            </p>
          </div>
          <PrimaryButton onClick={() => navigate('/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Journey
          </PrimaryButton>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'templates' ? 'templates' : 'best practices'}...`}
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-6 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'templates'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <LayoutTemplate className="w-5 h-5" />
              <span>Templates</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('best-practices')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'best-practices'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5" />
              <span>Best Practices</span>
            </div>
          </button>
        </div>

        {/* Filters */}
        <FilterSection
          selectedIndustry={selectedIndustry}
          selectedComplexity={selectedComplexity}
          onIndustryChange={setSelectedIndustry}
          onComplexityChange={setSelectedComplexity}
          onClearFilters={handleClearFilters}
        />

        {/* Content */}
        {activeTab === 'templates' ? (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Available Templates</h2>
                <span className="text-sm text-gray-600">
                  {filteredTemplates.length} of {templateData.length} templates
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onClick={() => handleTemplateClick(template)}
                  />
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">No templates found matching your criteria.</p>
                  <button
                    onClick={handleClearFilters}
                    className="text-indigo-600 hover:text-indigo-700 mt-2 font-medium"
                  >
                    Clear filters to see all templates
                  </button>
                </div>
              )}
            </div>

            {/* Usage Stats */}
            <StatsSection />
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Best Practices</h2>
                <span className="text-sm text-gray-600">
                  {filteredBestPractices.length} of {bestPracticesData.length} articles
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBestPractices.map((practice) => (
                  <BestPracticeCard
                    key={practice.id}
                    practice={practice}
                    onClick={() => {
                      console.log("Opening best practice:", practice.title)
                    }}
                  />
                ))}
              </div>

              {filteredBestPractices.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">No best practices found matching your criteria.</p>
                  <button
                    onClick={handleClearFilters}
                    className="text-indigo-600 hover:text-indigo-700 mt-2 font-medium"
                  >
                    Clear filters to see all articles
                  </button>
                </div>
              )}
            </div>

            {/* Learning Path Recommendations */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Learning Path</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {["Customer Research Fundamentals", "Journey Analytics & KPIs", "Advanced Touchpoint Mapping"].map((title, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-700">{title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Template Modal */}
      <TemplateModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        template={selectedTemplate}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  )
}