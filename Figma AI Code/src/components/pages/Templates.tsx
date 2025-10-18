import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, Eye, Copy, Bookmark, Star, Users, Map, Building, ShoppingCart, GraduationCap, DollarSign, Smartphone, Heart } from "lucide-react";

interface TemplatesProps {
  onUseTemplate?: (templateId: string) => void;
}

export function Templates({ onUseTemplate }: TemplatesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [useCaseFilter, setUseCaseFilter] = useState("all");

  const templates = [
    {
      id: "1",
      name: "SaaS Onboarding Journey",
      industry: "SaaS",
      useCase: "User Onboarding",
      personas: ["New User", "Trial User", "Free User"],
      phases: ["Awareness", "Trial", "Onboarding", "Usage", "Renewal"],
      description: "Complete onboarding experience for SaaS platforms",
      isPopular: true,
      isSaved: false,
      icon: Building
    },
    {
      id: "2",
      name: "E-commerce Purchase Flow",
      industry: "E-commerce", 
      useCase: "Purchase Journey",
      personas: ["First-time Buyer", "Returning Customer", "Price-conscious Shopper"],
      phases: ["Discovery", "Consideration", "Purchase", "Fulfillment", "Support"],
      description: "End-to-end purchasing experience for online retail",
      isPopular: true,
      isSaved: true,
      icon: ShoppingCart
    },
    {
      id: "3",
      name: "Financial Services Onboarding",
      industry: "Finance",
      useCase: "Account Opening",
      personas: ["New Customer", "Existing Bank Customer"],
      phases: ["Research", "Application", "Verification", "First Use"],
      description: "Secure and compliant financial account setup",
      isPopular: false,
      isSaved: false,
      icon: DollarSign
    },
    {
      id: "4",
      name: "Educational Course Enrollment",
      industry: "Education",
      useCase: "Student Journey",
      personas: ["Prospective Student", "Current Student", "Parent"],
      phases: ["Discovery", "Research", "Enrollment", "Learning", "Completion"],
      description: "Student experience from course discovery to completion",
      isPopular: false,
      isSaved: true,
      icon: GraduationCap
    },
    {
      id: "5",
      name: "Mobile App First Launch",
      industry: "Mobile",
      useCase: "App Onboarding",
      personas: ["New User", "Returning User"],
      phases: ["Download", "Setup", "First Use", "Engagement"],
      description: "Mobile-first onboarding and engagement flow",
      isPopular: true,
      isSaved: false,
      icon: Smartphone
    },
    {
      id: "6",
      name: "Healthcare Patient Portal",
      industry: "Healthcare",
      useCase: "Patient Experience",
      personas: ["New Patient", "Existing Patient", "Caregiver"],
      phases: ["Registration", "Appointment", "Visit", "Follow-up"],
      description: "Patient-centered healthcare service experience",
      isPopular: false,
      isSaved: false,
      icon: Heart
    }
  ];

  const savedTemplates = [
    {
      id: "custom-1",
      name: "My SaaS Onboarding (Customized)",
      industry: "SaaS",
      useCase: "Custom Onboarding",
      personas: ["Enterprise User", "Team Admin"],
      phases: ["Trial", "Demo", "Implementation", "Training", "Adoption"],
      description: "Customized template for enterprise SaaS onboarding",
      isCustom: true,
      icon: Building
    },
    {
      id: "custom-2", 
      name: "Subscription Renewal Flow",
      industry: "SaaS",
      useCase: "Customer Retention",
      personas: ["Existing Customer", "Churning Customer"],
      phases: ["Pre-renewal", "Decision", "Renewal", "Upsell"],
      description: "Custom template for subscription renewals",
      isCustom: true,
      icon: Building
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = industryFilter === "all" || template.industry === industryFilter;
    const matchesUseCase = useCaseFilter === "all" || template.useCase === useCaseFilter;
    return matchesSearch && matchesIndustry && matchesUseCase;
  });

  const industries = ["SaaS", "E-commerce", "Finance", "Education", "Mobile", "Healthcare"];
  const useCases = ["User Onboarding", "Purchase Journey", "Account Opening", "Student Journey", "App Onboarding", "Customer Retention"];

  const TemplateCard = ({ template, isCustom = false }: { template: any, isCustom?: boolean }) => {
    const IconComponent = template.icon;
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <IconComponent className="h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium line-clamp-1">{template.name}</h3>
                  {template.isPopular && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Popular</Badge>}
                  {isCustom && <Badge variant="secondary" className="bg-purple-100 text-purple-800">Custom</Badge>}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{template.industry}</span>
                  <span>•</span>
                  <span>{template.useCase}</span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className={template.isSaved ? "text-yellow-600" : ""}
            >
              {template.isSaved ? <Bookmark className="h-4 w-4 fill-current" /> : <Bookmark className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
          
          {/* Personas */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{template.personas.length} personas</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {template.personas.slice(0, 2).map((persona: string) => (
                <Badge key={persona} variant="outline" className="text-xs">
                  {persona}
                </Badge>
              ))}
              {template.personas.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{template.personas.length - 2} more
                </Badge>
              )}
            </div>
          </div>

          {/* Phases */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Map className="h-4 w-4" />
              <span>{template.phases.length} phases covered</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Eye className="h-3 w-3 mr-2" />
              Preview
            </Button>
            <Button 
              size="sm" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => onUseTemplate?.(template.id)}
            >
              <Copy className="h-3 w-3 mr-2" />
              Use Template
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
        <p className="text-gray-600">Start faster with ready-made journey frameworks tailored to your industry</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search templates..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map(industry => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={useCaseFilter} onValueChange={setUseCaseFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Use Case" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Use Cases</SelectItem>
              {useCases.map(useCase => (
                <SelectItem key={useCase} value={useCase}>{useCase}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="library" className="space-y-6">
        <TabsList>
          <TabsTrigger value="library">Template Library</TabsTrigger>
          <TabsTrigger value="saved">My Templates ({savedTemplates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          {/* Popular Templates */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
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
            <h2 className="text-xl font-semibold">All Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find relevant templates
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">My Saved Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} isCustom={template.isCustom} />
              ))}
            </div>
          </div>

          {/* Empty State for Saved */}
          {savedTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No saved templates yet</h3>
              <p className="text-muted-foreground mb-4">
                Save templates from the library or create custom ones to see them here
              </p>
              <Button variant="outline">
                Browse Template Library
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}