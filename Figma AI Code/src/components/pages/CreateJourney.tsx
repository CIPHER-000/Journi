import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";

interface CreateJourneyProps {
  onBack?: () => void;
  onCreateJourney?: (data: any) => void;
}

export function CreateJourney({ onBack, onCreateJourney }: CreateJourneyProps) {
  const [formData, setFormData] = useState({
    title: "",
    industry: "",
    businessGoals: "",
    targetPersonas: [] as string[],
    customPersona: "",
    journeyPhases: [] as string[],
    additionalContext: "",
    uploadedFiles: [] as File[]
  });

  const industries = [
    "SaaS & Technology",
    "E-commerce & Retail",
    "Healthcare",
    "Financial Services",
    "Education",
    "Manufacturing",
    "Professional Services",
    "Media & Entertainment",
    "Real Estate",
    "Travel & Hospitality",
    "Other"
  ];

  const predefinedPersonas = [
    "New User",
    "Returning Customer", 
    "Trial User",
    "Enterprise Admin",
    "Power User",
    "Casual User",
    "Mobile User",
    "Support Seeker"
  ];

  const journeyPhases = [
    "Awareness",
    "Consideration", 
    "Purchase/Signup",
    "Onboarding",
    "Usage/Engagement",
    "Support",
    "Renewal/Retention",
    "Advocacy"
  ];

  const handlePersonaToggle = (persona: string) => {
    setFormData(prev => ({
      ...prev,
      targetPersonas: prev.targetPersonas.includes(persona)
        ? prev.targetPersonas.filter(p => p !== persona)
        : [...prev.targetPersonas, persona]
    }));
  };

  const handleCustomPersonaAdd = () => {
    if (formData.customPersona.trim()) {
      setFormData(prev => ({
        ...prev,
        targetPersonas: [...prev.targetPersonas, prev.customPersona.trim()],
        customPersona: ""
      }));
    }
  };

  const handlePersonaRemove = (persona: string) => {
    setFormData(prev => ({
      ...prev,
      targetPersonas: prev.targetPersonas.filter(p => p !== persona)
    }));
  };

  const handlePhaseToggle = (phase: string) => {
    setFormData(prev => ({
      ...prev,
      journeyPhases: prev.journeyPhases.includes(phase)
        ? prev.journeyPhases.filter(p => p !== phase)
        : [...prev.journeyPhases, phase]
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['.pdf', '.docx', '.csv', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      return validTypes.includes(fileExtension);
    });

    setFormData(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...validFiles]
    }));
  };

  const handleFileRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateJourney?.(formData);
  };

  const isFormValid = formData.title && formData.industry && formData.businessGoals && 
                     formData.targetPersonas.length > 0 && formData.journeyPhases.length > 0;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create New Journey</h1>
          <p className="text-gray-600">Define your customer journey with AI-powered insights</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Journey Title */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Journey Title</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">What would you like to call this journey?</Label>
              <Input
                id="title"
                placeholder="e.g., SaaS Onboarding Flow, E-commerce Purchase Journey"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* Industry & Business Goals */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Business Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Industry Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Business Goals */}
            <div className="space-y-2">
              <Label htmlFor="businessGoals">Business Goals</Label>
              <Textarea
                id="businessGoals"
                placeholder="Describe what you want to achieve with this journey (e.g., increase user activation, reduce churn, improve onboarding experience)"
                value={formData.businessGoals}
                onChange={(e) => setFormData(prev => ({ ...prev, businessGoals: e.target.value }))}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Target Personas */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Target Personas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Predefined Personas */}
            <div className="space-y-3">
              <Label>Select from common personas:</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {predefinedPersonas.map((persona) => (
                  <div key={persona} className="flex items-center space-x-2">
                    <Checkbox
                      id={persona}
                      checked={formData.targetPersonas.includes(persona)}
                      onCheckedChange={() => handlePersonaToggle(persona)}
                    />
                    <Label htmlFor={persona} className="text-sm font-normal cursor-pointer">
                      {persona}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Persona */}
            <div className="space-y-3">
              <Label>Add custom persona:</Label>
              <div className="flex gap-2 max-w-md">
                <Input
                  placeholder="e.g., Enterprise Decision Maker"
                  value={formData.customPersona}
                  onChange={(e) => setFormData(prev => ({ ...prev, customPersona: e.target.value }))}
                />
                <Button type="button" onClick={handleCustomPersonaAdd} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Selected Personas */}
            {formData.targetPersonas.length > 0 && (
              <div className="space-y-2">
                <Label>Selected personas:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.targetPersonas.map((persona) => (
                    <Badge key={persona} variant="secondary" className="flex items-center gap-2">
                      {persona}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handlePersonaRemove(persona)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Journey Phases */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Journey Phases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Select the phases you want to include in this journey:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {journeyPhases.map((phase) => (
                  <div key={phase} className="flex items-center space-x-2">
                    <Checkbox
                      id={phase}
                      checked={formData.journeyPhases.includes(phase)}
                      onCheckedChange={() => handlePhaseToggle(phase)}
                    />
                    <Label htmlFor={phase} className="text-sm font-normal cursor-pointer">
                      {phase}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {formData.journeyPhases.length > 0 && (
              <div className="space-y-2">
                <Label>Selected phases:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.journeyPhases.map((phase) => (
                    <Badge key={phase} variant="outline">
                      {phase}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Research Files (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Upload research files to enhance AI analysis:</Label>
              <p className="text-sm text-gray-600">Supported formats: PDF, DOCX, CSV, TXT</p>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Click to upload files or drag and drop</p>
                <p className="text-sm text-gray-500">PDF, DOCX, CSV, TXT up to 10MB each</p>
              </label>
            </div>

            {/* Uploaded Files */}
            {formData.uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded files:</Label>
                <div className="space-y-2">
                  {formData.uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileRemove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Context */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Additional Context (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="additionalContext">Any additional information that might help our AI:</Label>
              <Textarea
                id="additionalContext"
                placeholder="e.g., specific challenges, constraints, existing data, or special requirements"
                value={formData.additionalContext}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalContext: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <Button 
            type="submit" 
            size="lg"
            disabled={!isFormValid}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
          >
            Create Journey
          </Button>
        </div>
      </form>
    </div>
  );
}