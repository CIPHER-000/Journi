import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Play,
  Sparkles,
  Menu,
  CheckCircle,
  MessageSquare,
  Target,
  Users,
  Map,
  BarChart3,
  Lightbulb,
  Rocket,
  Crown,
  Zap,
  TrendingUp,
  FileText,
  Star,
  ChevronRight,
  Mail,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Separator } from '../components/ui/separator'

export default function HomePage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [activeSection, setActiveSection] = useState("home")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && user) {
      navigate('/dashboard')
    }
  }, [user, loading, navigate])

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)

    if (sectionId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 90
      const elementPosition = element.offsetTop - offset
      window.scrollTo({ top: elementPosition, behavior: "smooth" })
    }
  }

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "how-it-works", "pricing"]
      const scrollPosition = window.scrollY + 110

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i])
        if (section && scrollPosition >= section.offsetTop) {
          setActiveSection(sections[i])
          break
        }
      }

      if (window.scrollY < 200) {
        setActiveSection("home")
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { id: "home", label: "Home" },
    { id: "how-it-works", label: "How It Works" },
    { id: "pricing", label: "Pricing" }
  ]

  const steps = [
    {
      number: 1,
      title: "Define Objectives",
      description: "Our AI agent analyzes your business goals and customer research to establish clear journey mapping objectives.",
      icon: Target,
      color: "bg-green-500"
    },
    {
      number: 2,
      title: "Gather Research",
      description: "Intelligent data collection from multiple sources including customer interviews, surveys, and behavioral analytics.",
      icon: MessageSquare,
      color: "bg-green-600"
    },
    {
      number: 3,
      title: "Create Personas",
      description: "AI-driven persona development based on real customer data and behavioral patterns for accurate representation.",
      icon: Users,
      color: "bg-green-700"
    },
    {
      number: 4,
      title: "Map Touchpoints",
      description: "Comprehensive touchpoint identification across all channels and interactions in the customer lifecycle.",
      icon: Map,
      color: "bg-green-500"
    },
    {
      number: 5,
      title: "Analyze Data",
      description: "Advanced analytics to identify patterns, pain points, and opportunities within the customer journey.",
      icon: BarChart3,
      color: "bg-green-600"
    },
    {
      number: 6,
      title: "Generate Insights",
      description: "AI-powered insight generation that reveals actionable opportunities for customer experience improvement.",
      icon: Lightbulb,
      color: "bg-green-700"
    },
    {
      number: 7,
      title: "Validate Findings",
      description: "Collaborative validation process ensuring accuracy and alignment with stakeholder expectations.",
      icon: CheckCircle,
      color: "bg-green-500"
    },
    {
      number: 8,
      title: "Deliver Results",
      description: "Professional journey maps with actionable recommendations and implementation roadmaps delivered instantly.",
      icon: Rocket,
      color: "bg-green-600"
    }
  ]

  const plans = [
    {
      name: "Starter",
      price: 0,
      description: "Entry-level plan for testing Journi before committing",
      icon: Zap,
      color: "bg-green-500",
      features: [
        "5 journey maps per month",
        "Basic AI agent workflow",
        "Email support",
        "Export to PDF/PNG",
        "1 user account",
        "Uses platform's own OpenAI API key for agentic operation"
      ],
      limitations: [
        "No templates included",
        "No analytics"
      ]
    },
    {
      name: "Professional",
      price: 15,
      description: "Advanced features for growing teams and detailed customer insights",
      icon: Sparkles,
      color: "bg-green-600",
      popular: true,
      features: [
        "25 journey maps per month",
        "Full AI agent orchestration",
        "Priority support",
        "Advanced export options"
      ],
      limitations: [
        "Custom templates (Coming Soon)",
        "Up to 5 user accounts (Coming Soon)",
        "Real-time collaboration (Coming Soon)",
        "Advanced analytics (Coming Soon)",
        "Integration APIs (Coming Soon)",
        "Custom branding (Coming Soon)"
      ]
    },
    {
      name: "Enterprise",
      price: null,
      description: "Custom solutions for large organizations with complex requirements",
      icon: Crown,
      color: "bg-gray-400",
      features: [
        "Unlimited journey maps",
        "Bring your own OpenAI API key",
        "White-label solution",
        "Dedicated support",
        "Custom integrations",
        "Unlimited users",
        "Advanced security",
        "Custom workflows",
        "SLA guarantees",
        "On-premise deployment"
      ],
      comingSoon: true
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Journi</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => navigate('/login')}
              >
                Log In
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      scrollToSection(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                        : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    variant="ghost"
                    className="justify-start text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => navigate('/login')}
                  >
                    Log In
                  </Button>
                  <Button
                    className="justify-start bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => navigate('/signup')}
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1754299520114-a04483392973?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMGpvdXJuZXklMjBtYXBwaW5nJTIwYW5hbHl0aWNzJTIwZGFzaGJvYXJkfGVufDF8fHx8MTc1ODI3NTExNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`
          }}
        />

        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/95 via-green-800/90 to-green-700/85" />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-green-300/15 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center pt-16">
          <div className="space-y-8">
            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg leading-tight">
                Map Customer Journeys
                <br />
                <span className="text-green-300">
                  in Minutes, Not Weeks
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                Journi uses AI-powered multi-agent orchestration to rapidly generate professional-grade customer journey maps.
                Transform your customer research into actionable insights with our 8-step collaborative workflow.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => navigate('/signup')}
              >
                Start Mapping Your Customer Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-white/90 hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900 border-2 border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm text-gray-900 dark:text-white"
                onClick={() => scrollToSection('how-it-works')}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="pt-12"
            >
              <p className="text-sm text-gray-200 mb-6">Trusted by innovative SaaS teams</p>
              <div className="flex items-center justify-center gap-8 opacity-70">
                {["TechCorp", "InnovateSaaS", "DataFlow", "CustomerFirst", "GrowthLab"].map((company, index) => (
                  <div key={index} className="text-lg font-semibold text-gray-200">
                    {company}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-green-900/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent leading-snug tracking-tight pb-2">
              How Journi's AI Agents Work Together
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Our 8-step collaborative workflow orchestrates specialized AI agents to deliver comprehensive
              customer journey maps with unprecedented speed and accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <Card
                  className="h-full group hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-green-200 dark:hover:border-green-700 bg-white dark:bg-gray-800/80 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Icon */}
                      <div className="flex items-center justify-center">
                        <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <step.icon className="h-7 w-7 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Connection Arrow (hidden on mobile) */}
                    {index < steps.length - 1 && index % 4 !== 3 && (
                      <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                        <ChevronRight className="w-8 h-8 text-green-400 dark:text-green-600" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/40 rounded-full border-2 border-green-200 dark:border-green-700 shadow-lg"
            >
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className="font-semibold text-green-800 dark:text-green-300">
                Complete journey maps generated in under 10 minutes
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent leading-snug tracking-tight pb-2">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Choose the perfect plan for your team. All plans include our core AI-powered journey mapping
              with no hidden fees or setup costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <Card
                  className={`h-full group transition-all duration-500 hover:shadow-2xl ${
                    plan.comingSoon
                      ? "border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 opacity-60"
                      : plan.popular
                        ? "border-2 border-green-200 dark:border-green-600 shadow-xl scale-105 ring-2 ring-green-100 dark:ring-green-900/20"
                        : "border-2 border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-600"
                  } bg-white dark:bg-gray-800/80 backdrop-blur-sm`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 shadow-lg">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  {plan.comingSoon && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 shadow-lg">
                        Coming Soon
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center space-y-6 pt-8 pb-4">
                    <div className={`w-20 h-20 mx-auto rounded-2xl ${plan.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <plan.icon className="h-10 w-10 text-white" />
                    </div>

                    <div>
                      <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                        {plan.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {plan.comingSoon ? (
                        <div className="space-y-2">
                          <div className="text-3xl font-bold text-gray-500 dark:text-gray-400">Coming Soon</div>
                          <p className="text-sm text-gray-400 dark:text-gray-500">Enterprise features in development</p>
                        </div>
                      ) : plan.price !== null && plan.price !== undefined ? (
                        <>
                          <div className="flex items-baseline justify-center gap-2">
                            <span className="text-5xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                            {plan.price > 0 && (
                              <span className="text-lg text-gray-600 dark:text-gray-400">/month</span>
                            )}
                          </div>
                          {plan.price > 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-500">per user, billed monthly</p>
                          )}
                        </>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-5xl font-bold text-gray-900 dark:text-white">Custom</div>
                          <p className="text-sm text-gray-500 dark:text-gray-500">Contact us for pricing</p>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-8">
                    <Button
                      className={`w-full text-lg py-4 font-semibold transition-all duration-300 ${
                        plan.comingSoon
                          ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : plan.popular
                            ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl"
                            : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white"
                      }`}
                      disabled={plan.comingSoon}
                      onClick={() => !plan.comingSoon && navigate(plan.price !== null && plan.price !== undefined ? '/signup' : '/contact')}
                    >
                      {plan.comingSoon ? "Coming Soon" : plan.price !== null && plan.price !== undefined ? "Start Free Trial" : "Contact Sales"}
                    </Button>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">What's included:</h4>
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {plan.limitations && (
                        <ul className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                          {plan.limitations.map((limitation, limitationIndex) => (
                            <li key={limitationIndex} className="flex items-start gap-3">
                              <div className="w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full" />
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Bottom Features */}
          <div className="mt-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4 p-6 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/40 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">14-day free trial</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">No credit card required</p>
              </div>
              <div className="text-center space-y-4 p-6 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/40 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Cancel anytime</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">No long-term contracts</p>
              </div>
              <div className="text-center space-y-4 p-6 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/40 rounded-xl flex items-center justify-center">
                  <Crown className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Enterprise ready</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">SOC 2 compliant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent leading-snug tracking-tight pb-2">
                Ready to Transform Your Customer Journey Mapping?
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Join hundreds of SaaS teams who are already using Journi to create better customer experiences.
                Start your free trial today and see the difference AI-powered journey mapping can make.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button className="px-10 py-5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg hover:scale-105 transform">
                Start Your Free Trial
              </Button>
              <Button variant="outline" className="px-10 py-5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-green-200 dark:border-green-700 rounded-xl font-semibold transition-all duration-300 text-lg hover:scale-105 transform hover:border-green-300 dark:hover:border-green-600 text-gray-900 dark:text-white">
                Schedule a Demo
              </Button>
            </div>

            <div className="pt-8 text-sm text-gray-500 dark:text-gray-500">
              <p>No credit card required • 14-day free trial • Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">J</span>
                </div>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">Journi</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                AI-powered customer journey mapping for modern SaaS teams.
                Transform customer research into actionable insights in minutes.
              </p>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <Github className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Product</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Features
                </a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Templates
                </a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Integrations
                </a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  API
                </a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Changelog
                </a>
              </div>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Company</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  About
                </a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Blog
                </a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Careers
                </a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Press
                </a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Partners
                </a>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Support</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Help Center
                </a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Documentation
                </a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Community
                </a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Contact Us
                </a>
                <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Status
                </a>
              </div>
              <div className="pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>hello@journi.ai</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 Journi. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}