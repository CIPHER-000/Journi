import { Card, CardContent } from "./ui/card";
import { 
  MessageSquare, 
  Target, 
  Users, 
  Map, 
  BarChart3, 
  Lightbulb, 
  CheckCircle,
  Rocket
} from "lucide-react";

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
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-muted/30">
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
  );
}