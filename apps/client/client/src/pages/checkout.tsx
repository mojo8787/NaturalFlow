import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

// If environment variable is defined, use it; otherwise, use test key
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51OkvwTIdlaQUZMwUdmRdQXsRSvJUxnZpHYlMCzh0oe4Bj2fxvPVQKMrPZSLFXP4X9vOLznJO5I64nCKjvS0glI3K00HGLxlWmf';
const stripePromise = loadStripe(stripePublicKey);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription-success`,
        },
      });

      if (error) {
        toast({
          title: t('paymentFailed'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t('paymentSuccessful'),
          description: t('subscriptionConfirmed'),
        });
      }
    } catch (error: any) {
      toast({
        title: t('paymentError'),
        description: error.message || t('unknownError'),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('processing')}
          </>
        ) : (
          <>
            {t('payNow')} - 25 JOD {t('monthly')}
          </>
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    if (!user && !authLoading) return;
    
    // Create PaymentIntent as soon as the page loads
    const fetchPaymentIntent = async () => {
      try {
        const res = await apiRequest("POST", "/api/create-payment-intent");
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        toast({
          title: t('paymentSetupFailed'),
          description: error.message || t('unknownError'),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [user, authLoading, t, toast]);

  // Wait for auth to complete
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (isLoading || !clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('checkoutTitle')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t('subscriptionSummary')}</CardTitle>
              <CardDescription>{t('monthlyWaterFiltractionService')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>{t('monthlySubscription')}</span>
                <span>25 JOD</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>{t('total')}</span>
                <span>25 JOD</span>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 text-sm">
              <p>{t('subscriptionBenefits')}</p>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t('paymentDetails')}</CardTitle>
              <CardDescription>{t('securePaymentProcessing')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}