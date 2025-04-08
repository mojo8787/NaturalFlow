import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { useLanguage } from "@/hooks/use-language";

export default function SubscriptionSuccess() {
  const { user } = useAuth();
  const { t } = useLanguage();

  // If user is not logged in, redirect to auth
  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <Card className="border-green-500 dark:border-green-700">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">
            {t('subscriptionSuccess')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('paymentProcessed')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h3 className="font-semibold mb-2">{t('subscriptionDetails')}:</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>{t('plan')}:</span>
                <span>{t('monthlyWaterService')}</span>
              </li>
              <li className="flex justify-between">
                <span>{t('amount')}:</span>
                <span>25 JOD</span>
              </li>
              <li className="flex justify-between">
                <span>{t('billingCycle')}:</span>
                <span>{t('monthly')}</span>
              </li>
              <li className="flex justify-between">
                <span>{t('status')}:</span>
                <span className="text-green-500 font-semibold">{t('active')}</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <h3 className="font-semibold mb-2">{t('whatNow')}:</h3>
            <p className="text-sm">
              {t('subscriptionSuccessMessage')}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/dashboard">
              {t('backToDashboard')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}