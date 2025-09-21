import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import {
  ArrowLeft, Crown, CheckCircle, Star, Zap, Shield, Headphones,
  ArrowRight, CreditCard, Loader2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function UpgradePage() {
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('pro')

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out journey mapping',
      features: [
        '5 journeys per month',
        'Basic journey mapping',
        'Standard templates',
        'Email support'
      ],
      limitations: [
        'Limited to 5 journeys monthly',
        'Basic analytics only',
        'Standard templates only'
      ],
      popular: false,
      current: userProfile?.plan_type === 'free'
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '$29',
      period: 'per month',
      description: 'For professionals and teams',
      features: [
        '25 journeys per month',
        'Advanced analytics',
        'Premium templates',
        'Priority support',
        'Custom branding',
        'API access',
        'Team collaboration'
      ],
      limitations: [],
      popular: true,
      current: userProfile?.plan_type === 'pro'
    }
  ]

  const handleUpgrade = async (planId: string) => {
    setLoading(true)

    try {
      // Simulate API call for upgrade
      setTimeout(() => {
        setLoading(false)
        // Show success message and redirect
        navigate('/dashboard')
      }, 2000)
    } catch (error) {
      setLoading(false)
      console.error('Upgrade failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Upgrade Your Plan</h1>
                <p className="text-gray-600">Choose the perfect plan for your journey mapping needs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Plan Status */}
        <Card className="bg-white border border-gray-200 rounded-lg mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Crown className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Current Plan</h3>
                  <p className="text-sm text-gray-600">
                    {userProfile?.plan_type === 'free' ? 'Free Plan' : 'Pro Plan'}
                  </p>
                </div>
              </div>
              <Badge className={`${userProfile?.plan_type === 'free' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                {userProfile?.journey_count || 0} journeys used
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`bg-white border-2 rounded-lg overflow-hidden transition-all hover:shadow-md ${
                plan.popular ? 'border-green-500 shadow-lg' : 'border-gray-200'
              } ${plan.current ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="bg-green-500 text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              {plan.current && (
                <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium">
                  Current Plan
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {plan.name}
                    </CardTitle>
                    <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                  </div>
                  {plan.popular && <Star className="h-5 w-5 text-yellow-500" />}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Limitations:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="h-4 w-4 rounded-full bg-gray-300 flex-shrink-0" />
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading || plan.current}
                  className={`w-full ${plan.current ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                    plan.popular ? 'bg-green-600 hover:bg-green-700 text-white' :
                    'bg-gray-900 hover:bg-gray-800 text-white'}`}
                >
                  {loading && selectedPlan === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : plan.current ? (
                    'Current Plan'
                  ) : (
                    <>
                      {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Benefits */}
        <Card className="bg-white border border-gray-200 rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Why Upgrade to Pro?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Advanced Analytics</h3>
                <p className="text-sm text-gray-600">
                  Get detailed insights and analytics about your customer journeys
                </p>
              </div>

              <div className="text-center">
                <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
                  <Headphones className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Priority Support</h3>
                <p className="text-sm text-gray-600">
                  Get help faster with our priority customer support
                </p>
              </div>

              <div className="text-center">
                <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Flexible Billing</h3>
                <p className="text-sm text-gray-600">
                  Cancel anytime with no long-term commitments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="bg-white border border-gray-200 rounded-lg mt-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Can I cancel my subscription anytime?</h3>
                <p className="text-sm text-gray-600">
                  Yes, you can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">What payment methods do you accept?</h3>
                <p className="text-sm text-gray-600">
                  We accept all major credit cards including Visa, MasterCard, and American Express.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Is there a discount for annual billing?</h3>
                <p className="text-sm text-gray-600">
                  Yes! Annual billing saves you 20% compared to monthly billing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}