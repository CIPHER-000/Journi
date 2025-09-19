import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, Sparkles, Crown, Zap } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: 29,
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
    price: 79,
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
    price: null,
    description: "Custom solutions for large organizations with complex requirements",
    icon: Crown,
    color: "bg-green-700",
    features: [
      "Unlimited journey maps",
      "Custom AI agent training",
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
];

export function PricingSection() {
  return (
    <section className="py-24">
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
                >
                  {plan.price ? "Start Free Trial" : "Contact Sales"}
                </Button>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
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
                <Check className="h-6 w-6 text-green-600" />
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
  );
}