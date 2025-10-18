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
];

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
];