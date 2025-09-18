import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Search, BookOpen, Lightbulb } from 'lucide-react'

// Import Figma components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Input } from '../components/ui/input'
import { TemplateCard } from '../components/TemplateCard'
import { BestPracticeCard } from '../components/BestPracticeCard'
import { TemplateModal } from '../components/TemplateModal'
import { FilterSection } from '../components/FilterSection'
import { StatsSection } from '../components/StatsSection'
import { templateData, bestPracticesData } from '../data/mockData'

export default function TemplatesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("templates")
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templateData[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("all")
  const [selectedComplexity, setSelectedComplexity] = useState("all")

  // Filter templates
  const filteredTemplates = templateData.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesIndustry = selectedIndustry === "all" || template.industry === selectedIndustry
    const matchesComplexity = selectedComplexity === "all" || template.complexity === selectedComplexity

    return matchesSearch && matchesIndustry && matchesComplexity
  })

  // Filter best practices
  const filteredBestPractices = bestPracticesData.filter(practice => {
    const matchesSearch = practice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         practice.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesComplexity = selectedComplexity === "all" || practice.difficulty === selectedComplexity

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
    setIsModalOpen(false)
  }

  const handleClearFilters = () => {
    setSelectedIndustry("all")
    setSelectedComplexity("all")
    setSearchQuery("")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-medium">Templates & Best Practices</h1>
            <p className="text-muted-foreground">
              Accelerate your customer journey mapping with proven templates and expert guidance
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="best-practices" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Best Practices
            </TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab === "templates" ? "templates" : "best practices"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <FilterSection
              selectedIndustry={selectedIndustry}
              selectedComplexity={selectedComplexity}
              onIndustryChange={setSelectedIndustry}
              onComplexityChange={setSelectedComplexity}
              onClearFilters={handleClearFilters}
            />
          </div>

          <TabsContent value="templates" className="space-y-8">
            {/* Templates Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2>Available Templates</h2>
                <span className="text-sm text-muted-foreground">
                  {filteredTemplates.length} of {templateData.length} templates
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    {...template}
                    onClick={() => handleTemplateClick(template)}
                  />
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No templates found matching your criteria.</p>
                  <button
                    onClick={handleClearFilters}
                    className="text-primary hover:underline mt-2"
                  >
                    Clear filters to see all templates
                  </button>
                </div>
              )}
            </div>

            {/* Usage Stats */}
            <StatsSection />
          </TabsContent>

          <TabsContent value="best-practices" className="space-y-8">
            {/* Best Practices Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2>Best Practices</h2>
                <span className="text-sm text-muted-foreground">
                  {filteredBestPractices.length} of {bestPracticesData.length} articles
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBestPractices.map((practice) => (
                  <BestPracticeCard
                    key={practice.id}
                    {...practice}
                    onClick={() => {
                      // In a real app, this would navigate to the article or open a modal
                      console.log("Opening best practice:", practice.title)
                    }}
                  />
                ))}
              </div>

              {filteredBestPractices.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No best practices found matching your criteria.</p>
                  <button
                    onClick={handleClearFilters}
                    className="text-primary hover:underline mt-2"
                  >
                    Clear filters to see all articles
                  </button>
                </div>
              )}
            </div>

            {/* Learning Path Recommendations */}
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="mb-4">Recommended Learning Path</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {["Customer Research Fundamentals", "Journey Analytics & KPIs", "Advanced Touchpoint Mapping"].map((title, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm">
                      {index + 1}
                    </div>
                    <span className="text-sm">{title}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

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