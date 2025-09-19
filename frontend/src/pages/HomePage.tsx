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
  Star
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'

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
      const offset = 80
      const elementPosition = element.offsetTop - offset
      window.scrollTo({ top: elementPosition, behavior: "smooth" })
    }
  }

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "how-it-works", "pricing"]
      const scrollPosition = window.scrollY + 100

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
      description: "Perfect for small teams getting started with customer journey mapping",
      icon: Zap,
      color: "bg-green-500",
      features: [
        "5 journey maps per month",
        "Basic AI agent workflow",
        "Standard templates",
        "Email support",
        "Export to PDF/PNG",
        "1 user account"
      ],
      limitations: [
        "Limited customization",
        "Basic analytics"
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
        "Custom templates",
        "Priority support",
        "Advanced export options",
        "Up to 5 user accounts",
        "Real-time collaboration",
        "Advanced analytics",
        "Integration APIs",
        "Custom branding"
      ]
    },
    {
      name: "Enterprise",
      price: 29,
      description: "Custom solutions for large organizations with complex requirements",
      icon: Crown,
      color: "bg-green-700",
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
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <span className="text-xl font-semibold">Journi</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`transition-colors hover:text-foreground ${
                    activeSection === item.id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/login')}>Log In</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => navigate('/signup')}>
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
            <div className="md:hidden py-4 border-t">
              <div className="space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      scrollToSection(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`block w-full text-left transition-colors hover:text-foreground ${
                      activeSection === item.id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="flex flex-col gap-2 pt-4">
                  <Button variant="ghost" className="justify-start" onClick={() => navigate('/login')}>Log In</Button>
                  <Button className="justify-start bg-green-600 hover:bg-green-700" onClick={() => navigate('/signup')}>
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1754299520114-a04483392973?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMGpvdXJuZXklMjBtYXBwaW5nJTIwYW5hbHl0aWNzJTIwZGFzaGJvYXJkfGVufDF8fHx8MTc1ODI3NTExNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`
          }}
        />

        {/* Background Overlay */}
        <div className="absolute inset-0 bg-green-900/85 dark:bg-green-950/90" />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-300/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-900/90 rounded-full border shadow-lg backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">AI-Powered Journey Mapping</span>
            </motion.div>

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
                className="text-lg px-8 py-6 bg-white/90 hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900 border-2 border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
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
      <section id="how-it-works" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Journi's AI Agents Work Together
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our 8-step collaborative workflow orchestrates specialized AI agents to deliver comprehensive
              customer journey maps with unprecedented speed and accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <Card
                key={step.number}
                className="relative group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200 dark:hover:border-green-800"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Step Number & Icon */}
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center shadow-lg`}>
                        <step.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-muted-foreground">{step.number}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connection Line (hidden on mobile) */}
                  {index < steps.length - 1 && index % 4 !== 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-green-300 dark:bg-green-700" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Complete journey maps generated in under 10 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Choose the perfect plan for your team. All plans include our core AI-powered journey mapping
              with no hidden fees or setup costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={plan.name}
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? "border-2 border-green-200 dark:border-green-800 shadow-lg scale-105"
                    : "border-2 hover:border-green-100 dark:hover:border-green-900"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center space-y-4 pt-8">
                  <div className={`w-16 h-16 mx-auto rounded-2xl ${plan.color} flex items-center justify-center shadow-lg`}>
                    <plan.icon className="h-8 w-8 text-white" />
                  </div>

                  <div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>

                  <div className="space-y-1">
                    {plan.price ? (
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold">${plan.price}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        <p className="text-sm text-muted-foreground">per user, billed monthly</p>
                      </>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-4xl font-bold">Custom</div>
                        <p className="text-sm text-muted-foreground">Contact us for pricing</p>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-green-600 hover:bg-green-700"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => navigate(plan.price ? '/signup' : '/contact')}
                  >
                    {plan.price ? "Start Free Trial" : "Contact Sales"}
                  </Button>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">What's included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.limitations && (
                      <ul className="space-y-2 pt-2 border-t">
                        {plan.limitations.map((limitation, limitationIndex) => (
                          <li key={limitationIndex} className="flex items-start gap-2">
                            <div className="w-4 h-4 mt-0.5 flex-shrink-0 rounded-full border border-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom Features */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold">14-day free trial</h4>
                <p className="text-sm text-muted-foreground">No credit card required</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold">Cancel anytime</h4>
                <p className="text-sm text-muted-foreground">No long-term contracts</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Crown className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold">Enterprise ready</h4>
                <p className="text-sm text-muted-foreground">SOC 2 compliant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-green-50 dark:bg-green-950/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Transform Your Customer Journey Mapping?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join hundreds of SaaS teams who are already using Journi to create better customer experiences.
                Start your free trial today and see the difference AI-powered journey mapping can make.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg">
                Start Your Free Trial
              </Button>
              <Button variant="outline" className="px-8 py-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-border rounded-lg font-medium transition-all duration-300 text-lg">
                Schedule a Demo
              </Button>
            </div>

            <div className="pt-8 text-sm text-muted-foreground">
              <p>No credit card required • 14-day free trial • Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <span className="text-xl font-bold">Journi</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 Journi. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}