/**
 * Payment Callback Page
 * Handles redirects from Paystack after payment completion
 */

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import paymentService from '../services/paymentService'

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  const [message, setMessage] = useState('Verifying your payment...')
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  useEffect(() => {
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    try {
      // Get payment reference from URL
      const reference = searchParams.get('reference') || searchParams.get('trxref')

      if (!reference) {
        setStatus('failed')
        setMessage('Payment reference not found. Please contact support.')
        return
      }

      // Verify payment with backend
      const result = await paymentService.verifyPayment(reference)

      if (result.success && result.status === 'success') {
        setStatus('success')
        setMessage(result.message || 'Payment successful! Your plan has been upgraded.')
        setPaymentDetails(result)

        // Redirect to account page after 3 seconds
        setTimeout(() => {
          navigate('/account')
        }, 3000)
      } else {
        setStatus('failed')
        setMessage(result.message || 'Payment verification failed. Please contact support.')
      }

    } catch (error: any) {
      console.error('Payment verification error:', error)
      setStatus('failed')
      setMessage(error.message || 'Failed to verify payment. Please contact support.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'verifying' && (
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-600" />
            )}
            {status === 'failed' && (
              <XCircle className="h-16 w-16 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'verifying' && 'Processing Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <p className="text-gray-600">{message}</p>

          {paymentDetails && status === 'success' && (
            <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">
                  {paymentDetails.currency} {(paymentDetails.amount / 100).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reference:</span>
                <span className="font-mono text-xs">{paymentDetails.reference}</span>
              </div>
            </div>
          )}

          {status === 'success' && (
            <p className="text-sm text-gray-500">
              Redirecting to your account in a moment...
            </p>
          )}

          {status === 'failed' && (
            <div className="space-y-2">
              <Button
                onClick={() => navigate('/account')}
                className="w-full"
              >
                Go to Account
              </Button>
              <Button
                onClick={() => window.location.href = 'mailto:support@getjourni.com'}
                variant="outline"
                className="w-full"
              >
                Contact Support
              </Button>
            </div>
          )}

          {status === 'success' && (
            <Button
              onClick={() => navigate('/account')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              View Account
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
