import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Check, Crown, Zap, Users, FileText, Headphones } from "lucide-react";

interface AccountProps {
  onUpgrade?: () => void;
}

export function Account({ onUpgrade }: AccountProps) {
  const currentPlan = {
    name: "Free",
    price: "$0",
    journeys: { used: 3, total: 5 },
    features: [
      "5 journeys total",
      "Basic templates",
      "PDF exports",
      "Community support"
    ]
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "5 journeys total",
        "Basic templates",
        "PDF exports", 
        "Community support"
      ],
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For growing teams and businesses",
      features: [
        "25 journeys per month",
        "Advanced templates",
        "Multiple export formats",
        "Priority support",
        "Team collaboration",
        "Advanced analytics"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large organizations",
      features: [
        "Unlimited journeys",
        "Custom templates",
        "API access",
        "Dedicated support",
        "Advanced integrations",
        "Custom branding",
        "SSO authentication"
      ],
      popular: false
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Account & Billing</h1>
        <p className="text-gray-600">Manage your subscription and billing preferences</p>
      </div>

      {/* Current Plan Status */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{currentPlan.name} Plan</h3>
              <p className="text-gray-600">{currentPlan.price}/month</p>
            </div>
            <Badge variant="outline" className="text-gray-600">
              Current
            </Badge>
          </div>

          {/* Usage Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Journey Usage</span>
              <span className="font-medium text-gray-900">
                {currentPlan.journeys.used}/{currentPlan.journeys.total} journeys used
              </span>
            </div>
            <Progress 
              value={(currentPlan.journeys.used / currentPlan.journeys.total) * 100} 
              className="h-2"
            />
            <p className="text-xs text-gray-500">
              {currentPlan.journeys.total - currentPlan.journeys.used} journeys remaining
            </p>
          </div>

          {/* Current Features */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">Current Features:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-600" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Plans */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Available Plans</h2>
          <p className="text-gray-600">Choose the plan that best fits your needs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={`bg-white shadow-sm relative ${
              plan.popular 
                ? "border-2 border-green-500 shadow-lg" 
                : "border border-gray-200"
            }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-gray-900">
                      {plan.price}
                      {plan.name !== "Enterprise" && (
                        <span className="text-base font-normal text-gray-600">/{plan.period}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={onUpgrade}
                  className={`w-full ${
                    plan.name === currentPlan.name
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : plan.popular
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
                  }`}
                  disabled={plan.name === currentPlan.name}
                >
                  {plan.name === currentPlan.name ? "Current Plan" : 
                   plan.name === "Enterprise" ? "Contact Sales" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing Information */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">Payment Method</p>
              <p className="text-sm text-gray-600">No payment method on file</p>
              <Button variant="outline" size="sm">
                Add Payment Method
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">Next Billing Date</p>
              <p className="text-sm text-gray-600">N/A - Free Plan</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">Our team is here to help you get the most out of Journi.</p>
            <div className="flex gap-4">
              <Button variant="outline">
                Contact Support
              </Button>
              <Button variant="outline">
                View Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}