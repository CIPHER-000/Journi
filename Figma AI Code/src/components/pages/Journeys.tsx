import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { JourneyCard } from "../app/JourneyCard";
import { UsageIndicator } from "../app/UsageIndicator";
import { Plus, Search, Filter, Grid, List, Calendar, Users, Map } from "lucide-react";

interface JourneysProps {
  onCreateJourney?: () => void;
  onUpgrade?: () => void;
}

export function Journeys({ onCreateJourney, onUpgrade }: JourneysProps) {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Mock data
  const userPlan = "free";
  const usageData = {
    used: 3,
    total: userPlan === "free" ? 5 : 25,
    resetDate: userPlan === "pro" ? "Jan 15" : undefined
  };

  const journeys = [
    {
      id: "1",
      title: "SaaS Onboarding Flow",
      status: "completed" as const,
      personas: ["New User", "Trial User"],
      phases: ["Awareness", "Trial", "Onboarding", "Usage", "Renewal"],
      dateCreated: "Dec 8",
      lastModified: "Dec 10"
    },
    {
      id: "2", 
      title: "E-commerce Purchase Journey",
      status: "in-progress" as const,
      personas: ["First-time Buyer", "Returning Customer"],
      phases: ["Discovery", "Consideration", "Purchase", "Support"],
      dateCreated: "Dec 5",
      lastModified: "Dec 9"
    },
    {
      id: "3",
      title: "Support Ticket Resolution",
      status: "draft" as const,
      personas: ["Frustrated User"],
      phases: ["Problem", "Contact", "Resolution"],
      dateCreated: "Dec 1",
      lastModified: "Dec 1"
    },
    {
      id: "4",
      title: "Mobile App First Use",
      status: "completed" as const,
      personas: ["Mobile User", "First-time User"],
      phases: ["Download", "Setup", "First Use", "Engagement"],
      dateCreated: "Nov 28",
      lastModified: "Dec 2"
    },
    {
      id: "5",
      title: "Subscription Renewal Flow",
      status: "in-progress" as const,
      personas: ["Existing Customer", "Power User"],
      phases: ["Pre-renewal", "Decision", "Renewal", "Upsell"],
      dateCreated: "Nov 25",
      lastModified: "Dec 7"
    }
  ];

  const filteredJourneys = journeys.filter(journey => {
    const matchesSearch = journey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         journey.personas.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || journey.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    "in-progress": "bg-yellow-100 text-yellow-800", 
    completed: "bg-green-100 text-green-800"
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Journeys</h1>
          <p className="text-gray-600">Manage and track all your customer journey maps</p>
        </div>
        <div className="flex items-center gap-3">
          <UsageIndicator 
            plan={userPlan as "free" | "pro"}
            used={usageData.used}
            total={usageData.total}
            resetDate={usageData.resetDate}
            onUpgrade={onUpgrade}
            className="hidden lg:block"
          />
          <Button 
            onClick={onCreateJourney}
            className="bg-green-600 hover:bg-green-700 gap-2"
            disabled={usageData.used >= usageData.total}
          >
            <Plus className="h-4 w-4" />
            Create New Journey
          </Button>
        </div>
      </div>

      {/* Mobile Usage Indicator */}
      <div className="lg:hidden">
        <UsageIndicator 
          plan={userPlan as "free" | "pro"}
          used={usageData.used}
          total={usageData.total}
          resetDate={usageData.resetDate}
          onUpgrade={onUpgrade}
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search journeys..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg">
            <Button 
              variant={viewMode === "cards" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("cards")}
              className={viewMode === "cards" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "table" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("table")}
              className={viewMode === "table" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJourneys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Journey Name</TableHead>
                <TableHead>Personas</TableHead>
                <TableHead>Phases</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJourneys.map((journey) => (
                <TableRow key={journey.id}>
                  <TableCell className="font-medium">{journey.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {journey.personas.length}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Map className="h-3 w-3" />
                      {journey.phases.length}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[journey.status]}>
                      {journey.status.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {journey.dateCreated}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Empty State */}
      {filteredJourneys.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Map className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No journeys found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your filters or search terms"
              : "Get started by creating your first customer journey map"
            }
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Button 
              onClick={onCreateJourney}
              className="bg-green-600 hover:bg-green-700 gap-2"
              disabled={usageData.used >= usageData.total}
            >
              <Plus className="h-4 w-4" />
              Create Your First Journey
            </Button>
          )}
        </div>
      )}
    </div>
  );
}