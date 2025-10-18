import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Input } from "../components/ui/input";
import {
  Download, Edit, Calendar, Users, TrendingDown, TrendingUp, AlertTriangle,
  Lightbulb, ArrowRight, FileText, MessageSquare, Target, Zap
} from "lucide-react";
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'

interface ReportsProps {
  journeyId?: string;
}

export default function ReportsPage({ journeyId }: ReportsProps) {
  const navigate = useNavigate()
  const [journeyTitle, setJourneyTitle] = useState("SaaS Onboarding Flow");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Mock journey data
  const journeyData = {
    id: "1",
    title: journeyTitle,
    dateCreated: "Dec 8, 2024",
    phases: [
      {
        id: "awareness",
        name: "Awareness",
        customerActions: [
          "Searches for solution online",
          "Reads blog posts and reviews",
          "Compares different tools"
        ],
        painPoints: [
          "Too many options to choose from",
          "Unclear pricing information",
          "Complex feature comparisons"
        ],
        opportunities: [
          "Simplified comparison charts",
          "Clear value proposition",
          "Free trial CTA placement"
        ],
        personas: ["new-user", "trial-user"]
      },
      {
        id: "trial",
        name: "Trial Signup",
        customerActions: [
          "Signs up for free trial",
          "Provides basic information",
          "Receives welcome email"
        ],
        painPoints: [
          "Long signup form",
          "Email verification delays",
          "Unclear trial duration"
        ],
        opportunities: [
          "Reduce form fields",
          "Instant account activation",
          "Clear trial timeline"
        ],
        personas: ["new-user"]
      },
      {
        id: "onboarding",
        name: "Initial Setup",
        customerActions: [
          "Completes profile setup",
          "Connects integrations",
          "Invites team members"
        ],
        painPoints: [
          "Complex setup process",
          "Missing integration guides",
          "Unclear permission system"
        ],
        opportunities: [
          "Guided setup wizard",
          "Video tutorials",
          "Smart defaults"
        ],
        personas: ["new-user", "trial-user"]
      },
      {
        id: "usage",
        name: "First Value",
        customerActions: [
          "Creates first project",
          "Explores core features",
          "Generates first report"
        ],
        painPoints: [
          "Feature discovery issues",
          "Steep learning curve",
          "Time to first value too long"
        ],
        opportunities: [
          "Interactive product tour",
          "Quick win templates",
          "Contextual help"
        ],
        personas: ["new-user", "trial-user"]
      },
      {
        id: "renewal",
        name: "Conversion",
        customerActions: [
          "Reviews trial usage",
          "Evaluates pricing plans",
          "Makes purchase decision"
        ],
        painPoints: [
          "Pricing confusion",
          "Feature limitations unclear",
          "No sales support"
        ],
        opportunities: [
          "Usage-based recommendations",
          "Clear upgrade prompts",
          "Sales chat support"
        ],
        personas: ["trial-user"]
      }
    ],
    personas: [
      {
        id: "new-user",
        name: "New User",
        color: "bg-blue-500",
        description: "First-time users exploring the platform"
      },
      {
        id: "trial-user",
        name: "Trial User",
        color: "bg-green-500",
        description: "Users actively evaluating the product"
      }
    ],
    insights: {
      summary: "The biggest drop-off occurs during the initial setup phase, with 67% of trial users not completing the onboarding process.",
      bottlenecks: [
        {
          phase: "Initial Setup",
          issue: "Complex integration setup",
          impact: "67% drop-off rate",
          severity: "high"
        },
        {
          phase: "First Value",
          issue: "Time to first meaningful action",
          impact: "Average 45 minutes",
          severity: "medium"
        }
      ],
      recommendations: [
        {
          priority: "high",
          title: "Simplify Integration Setup",
          description: "Implement a guided wizard with smart defaults and optional advanced settings",
          impact: "Could reduce drop-off by 30-40%"
        },
        {
          priority: "medium",
          title: "Add Quick Win Templates",
          description: "Provide pre-built templates that new users can customize immediately",
          impact: "Reduce time to first value by 60%"
        },
        {
          priority: "low",
          title: "Enhanced Progress Indicators",
          description: "Show clear progress through onboarding with estimated time remaining",
          impact: "Improved user confidence and completion rates"
        }
      ]
    }
  };

  const getPersonaColor = (personaId: string) => {
    const persona = journeyData.personas.find(p => p.id === personaId);
    return persona?.color || "bg-gray-500";
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Reports</h1>
                <p className="text-gray-600">View and download your journey analysis reports</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Export DOCX
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Journey Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            {isEditingTitle ? (
              <Input
                value={journeyTitle}
                onChange={(e) => setJourneyTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                className="text-3xl font-bold border-none p-0 h-auto"
                autoFocus
              />
            ) : (
              <h1
                className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-gray-600 transition-colors"
                onClick={() => setIsEditingTitle(true)}
              >
                {journeyTitle}
                <Edit className="inline h-4 w-4 ml-2" />
              </h1>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Created {journeyData.dateCreated}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {journeyData.personas.length} personas
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Summary */}
        <Card className="border-l-4 border-l-green-600">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Lightbulb className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">🔍 Key Insight</h3>
                <p className="text-gray-600">{journeyData.insights.summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Journey Map Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Journey Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Personas Legend */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Personas:</span>
                {journeyData.personas.map((persona) => (
                  <div key={persona.id} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${persona.color}`}></div>
                    <span className="text-sm">{persona.name}</span>
                  </div>
                ))}
              </div>

              {/* Journey Phases */}
              <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {journeyData.phases.map((phase, index) => (
                    <div key={phase.id} className="min-w-[300px] space-y-4">
                      {/* Phase Header */}
                      <div className="text-center">
                        <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
                          {phase.name}
                        </div>
                        {index < journeyData.phases.length - 1 && (
                          <ArrowRight className="h-6 w-6 text-gray-400 mx-auto mt-2" />
                        )}
                      </div>

                      {/* Phase Content */}
                      <div className="space-y-4">
                        {/* Customer Actions */}
                        <div className="border rounded-lg p-4 bg-blue-50">
                          <h4 className="font-medium mb-2 text-blue-800">Customer Actions</h4>
                          <ul className="space-y-1 text-sm">
                            {phase.customerActions.map((action, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Pain Points */}
                        <div className="border rounded-lg p-4 bg-red-50">
                          <h4 className="font-medium mb-2 text-red-800 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            Pain Points
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {phase.painPoints.map((pain, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                {pain}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Opportunities */}
                        <div className="border rounded-lg p-4 bg-yellow-50">
                          <h4 className="font-medium mb-2 text-yellow-800 flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            Opportunities
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {phase.opportunities.map((opp, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                                {opp}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Persona Indicators */}
                        <div className="flex gap-1">
                          {phase.personas.map((personaId) => (
                            <div
                              key={personaId}
                              className={`w-3 h-3 rounded-full ${getPersonaColor(personaId)}`}
                              title={journeyData.personas.find(p => p.id === personaId)?.name}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bottlenecks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Identified Bottlenecks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {journeyData.insights.bottlenecks.map((bottleneck, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{bottleneck.phase}</h4>
                    <Badge variant="destructive" className={bottleneck.severity === "high" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
                      {bottleneck.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{bottleneck.issue}</p>
                  <p className="text-sm font-medium text-red-600">{bottleneck.impact}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {journeyData.insights.recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{rec.title}</h4>
                    <Badge variant="secondary" className={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <p className="text-sm font-medium text-green-600">{rec.impact}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Persona Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Persona Journey Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {journeyData.personas.map((persona) => (
                <div key={persona.id} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${persona.color}`}></div>
                    <div>
                      <h3 className="font-medium">{persona.name}</h3>
                      <p className="text-sm text-gray-600">{persona.description}</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-sm">Journey Path:</h4>
                    <div className="flex flex-wrap gap-1">
                      {journeyData.phases
                        .filter(phase => phase.personas.includes(persona.id))
                        .map((phase, index, arr) => (
                          <div key={phase.id} className="flex items-center">
                            <Badge variant="outline" className="text-xs">
                              {phase.name}
                            </Badge>
                            {index < arr.length - 1 && (
                              <ArrowRight className="h-3 w-3 mx-1 text-gray-400" />
                            )}
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Context */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Research Context & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Uploaded Research Files</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>User Interview Transcripts (Dec 5, 2024)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>Customer Survey Results Q4 (Nov 28, 2024)</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Key Research Findings</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 78% of users found the initial setup process confusing</li>
                <li>• Time to first value averages 45 minutes (target: 15 minutes)</li>
                <li>• Integration setup is the #1 reason for trial abandonment</li>
                <li>• Users who complete onboarding have 89% conversion rate</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}