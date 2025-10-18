import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { Plus, Map, FileText, BookOpen, Eye, Edit, Crown, TrendingUp } from "lucide-react";

interface DashboardProps {
  onCreateJourney?: () => void;
  onUpgrade?: () => void;
}

export function Dashboard({ onCreateJourney, onUpgrade }: DashboardProps) {
  // Mock data - simplified version back to original
  const metrics = {
    journeysCreated: 12,
    reportsGenerated: 8,
    templatesUsed: 5
  };

  // Plan usage data - Change this to test different plans
  const planUsage = {
    used: 3,
    total: 5,
    plan: "Free" // Try "Pro" to test Pro plan UI
  };

  // For Pro plan, show monthly reset
  const isProPlan = planUsage.plan === "Pro";
  const proUsage = {
    used: 12,
    total: 25,
    resetDate: "Jan 15, 2025"
  };

  const recentJourneys = [
    {
      id: "1",
      title: "SaaS Onboarding Flow",
      status: "Complete",
      lastUpdated: "2 days ago"
    },
    {
      id: "2", 
      title: "E-commerce Purchase Journey",
      status: "In Progress",
      lastUpdated: "1 week ago"
    }
  ];

  const recentReports = [
    {
      id: "1",
      title: "SaaS Onboarding Analysis",
      createdDate: "Dec 10, 2024"
    },
    {
      id: "2",
      title: "E-commerce Journey Report", 
      createdDate: "Dec 9, 2024"
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header with Create Button */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your journey mapping overview.</p>
          </div>
          
          <Button 
            onClick={onCreateJourney}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base font-medium gap-3"
          >
            <Plus className="h-5 w-5" />
            Create New Journey
          </Button>
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm border border-gray-200 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Map className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Journeys Created</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.journeysCreated}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Reports Generated</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.reportsGenerated}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Templates Used</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.templatesUsed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Usage Card */}
      <Card className="bg-white shadow-sm border border-gray-200 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Plan Usage</h3>
                <p className="text-sm text-gray-600">{isProPlan ? "Pro" : "Free"} Plan</p>
              </div>
            </div>
            
            {!isProPlan && (
              <Button 
                onClick={onUpgrade}
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Upgrade
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {isProPlan ? "Journeys This Month" : "Journeys Used"}
              </span>
              <span className="font-medium text-gray-900">
                {isProPlan ? `${proUsage.used}/${proUsage.total}` : `${planUsage.used}/${planUsage.total}`} used
              </span>
            </div>
            <Progress 
              value={isProPlan ? (proUsage.used / proUsage.total) * 100 : (planUsage.used / planUsage.total) * 100} 
              className="h-2"
            />
            
            {isProPlan && (
              <p className="text-xs text-gray-500">
                Resets on {proUsage.resetDate}
              </p>
            )}
            
            {!isProPlan && planUsage.used >= planUsage.total * 0.8 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-3">
                <p className="text-sm text-yellow-800">
                  You're running low on journeys. Upgrade to Pro for 25 journeys per month.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Journeys */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Journeys</h2>
            <Button variant="outline" size="sm" className="text-gray-600">
              View All
            </Button>
          </div>
          
          <Card className="bg-white shadow-sm border border-gray-200 rounded-xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentJourneys.map((journey) => (
                  <div key={journey.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900">{journey.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          journey.status === "Complete" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {journey.status}
                        </span>
                        <span>Updated {journey.lastUpdated}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
            <Button variant="outline" size="sm" className="text-gray-600">
              View All
            </Button>
          </div>
          
          <Card className="bg-white shadow-sm border border-gray-200 rounded-xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-600">Generated {report.createdDate}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}