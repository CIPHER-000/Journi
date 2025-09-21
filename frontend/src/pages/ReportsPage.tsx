import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Search, Filter, Download, Eye, FileText, Calendar, Star,
  ArrowUpDown, Clock, CheckCircle, AlertCircle, Loader2, Zap
} from "lucide-react";
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

interface Report {
  id: string
  title: string
  journeyTitle: string
  type: 'analysis' | 'summary' | 'recommendations' | 'metrics'
  createdAt: Date | string
  fileSize: string
  status: 'completed' | 'processing' | 'failed'
  downloadUrl?: string
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'

export default function ReportsPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Mock reports data
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)

      // Simulate API call with mock data
      setTimeout(() => {
        const mockReports: Report[] = [
          {
            id: '1',
            title: 'E-commerce Customer Journey Analysis',
            journeyTitle: 'E-commerce Customer Experience',
            type: 'analysis',
            createdAt: new Date('2024-01-15'),
            fileSize: '2.4 MB',
            status: 'completed',
            downloadUrl: '#'
          },
          {
            id: '2',
            title: 'Healthcare Patient Journey Summary',
            journeyTitle: 'Healthcare Patient Experience',
            type: 'summary',
            createdAt: new Date('2024-01-12'),
            fileSize: '1.8 MB',
            status: 'completed',
            downloadUrl: '#'
          },
          {
            id: '3',
            title: 'Banking Customer Journey Recommendations',
            journeyTitle: 'Banking Customer Experience',
            type: 'recommendations',
            createdAt: new Date('2024-01-10'),
            fileSize: '3.1 MB',
            status: 'processing'
          },
          {
            id: '4',
            title: 'Retail Shopping Journey Metrics',
            journeyTitle: 'Retail Customer Experience',
            type: 'metrics',
            createdAt: new Date('2024-01-08'),
            fileSize: '1.2 MB',
            status: 'completed',
            downloadUrl: '#'
          },
          {
            id: '5',
            title: 'SaaS User Journey Analysis',
            journeyTitle: 'SaaS User Onboarding',
            type: 'analysis',
            createdAt: new Date('2024-01-05'),
            fileSize: '2.7 MB',
            status: 'failed'
          }
        ]

        setReports(mockReports)
        setLoading(false)
      }, 1000)
    }

    fetchReports()
  }, [])

  // Filter reports based on search and filters
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.journeyTitle.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || report.type === typeFilter
    const matchesDate = dateFilter === "all" || true // Simplified for now

    return matchesSearch && matchesType && matchesDate
  })

  // Handle actions
  const handleViewReport = (id: string) => {
    console.log('View report:', id)
  }

  const handleDownloadReport = (id: string) => {
    console.log('Download report:', id)
  }

  // Status colors
  const statusColors = {
    'completed': 'bg-green-100 text-green-700',
    'processing': 'bg-blue-100 text-blue-700',
    'failed': 'bg-red-100 text-red-700'
  }

  const statusIcons = {
    'completed': CheckCircle,
    'processing': Loader2,
    'failed': AlertCircle
  }

  // Type colors
  const typeColors = {
    'analysis': 'bg-purple-100 text-purple-700',
    'summary': 'bg-blue-100 text-blue-700',
    'recommendations': 'bg-green-100 text-green-700',
    'metrics': 'bg-orange-100 text-orange-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">Loading your reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <Button className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg font-medium">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports by title or journey..."
                  className="pl-10 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] border-gray-300 rounded-lg">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="recommendations">Recommendations</SelectItem>
                  <SelectItem value="metrics">Metrics</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px] border-gray-300 rounded-lg">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || typeFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Generate journey maps to create reports"
                }
              </p>
              <Button
                onClick={() => navigate('/create')}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                Create Journey
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => {
              const StatusIcon = statusIcons[report.status]
              return (
                <Card key={report.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-medium text-gray-900 mb-1 line-clamp-2">
                          {report.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600 truncate">
                          {report.journeyTitle}
                        </p>
                      </div>
                      <Badge className={`${typeColors[report.type]} text-xs`}>
                        {report.type}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(report.createdAt), 'MMM d, yyyy')}
                      </div>
                      <span className="text-gray-500">{report.fileSize}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <StatusIcon className={`h-4 w-4 ${report.status === 'processing' ? 'animate-spin' : ''}`} />
                        <span className={`text-xs font-medium ${statusColors[report.status]}`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReport(report.id)}
                          className="border-gray-300 hover:bg-gray-50 p-2"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>

                        {report.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReport(report.id)}
                            className="border-gray-300 hover:bg-gray-50 p-2"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {reports.filter(r => r.status === 'processing').length}
              </div>
              <div className="text-sm text-gray-600">Processing</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {(reports.reduce((total, report) => total + parseFloat(report.fileSize), 0)).toFixed(1)} MB
              </div>
              <div className="text-sm text-gray-600">Total Size</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}