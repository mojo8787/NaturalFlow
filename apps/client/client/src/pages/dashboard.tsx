import { useQuery } from "@tanstack/react-query";
import { Subscription, Reward } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package2, Bell, Droplet, Gift, Copy, Ticket, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { HeroCarousel } from "@/components/ui/hero-carousel";
import { RemindersList } from "@/components/ui/reminders-list";
import { getAds } from "@/lib/ads-service";

export default function Dashboard() {
  const { toast } = useToast();
  const { t, dir } = useLanguage();
  
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery<Subscription>({
    queryKey: ["/api/subscription"],
  });

  const { data: referralCode, isLoading: isLoadingReferral } = useQuery<{ referralCode: string }>({
    queryKey: ["/api/referral-code"],
  });

  const { data: rewards = [], isLoading: isLoadingRewards } = useQuery<Reward[]>({
    queryKey: ["/api/rewards"],
  });

  const isLoading = isLoadingSubscription || isLoadingReferral || isLoadingRewards;

  const copyReferralCode = async () => {
    if (referralCode?.referralCode) {
      await navigator.clipboard.writeText(referralCode.referralCode);
      toast({
        title: t("copied"),
        description: t("referralInstructions"),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeRewards = rewards.filter(reward => reward.status === "active");

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <div className="flex h-16 items-center gap-4 border-b px-4 md:px-6">
        <MobileNav />
        <div className="flex items-center gap-2">
          <Droplet className="h-6 w-6 text-primary" />
          <span className="font-semibold">PureFlow</span>
        </div>
        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
        <div className="grid gap-4 md:grid-cols-[200px_1fr]">
          <div className="hidden md:block">
            <DashboardNav />
          </div>

          <main className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">{t("dashboard")}</h1>
            
            {/* Hero Carousel */}
            <div className="mb-6">
              <HeroCarousel ads={getAds(t("lang"))} className="rounded-lg overflow-hidden" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Referral Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("yourReferralCode")}
                  </CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                      {referralCode?.referralCode || t("loading")}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={copyReferralCode}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("referralInstructions")}
                  </p>
                </CardContent>
              </Card>

              {/* Active Rewards Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("referralBonus")}
                  </CardTitle>
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {activeRewards.length > 0 ? (
                    <div className="space-y-2">
                      {activeRewards.map(reward => (
                        <div key={reward.id} className="rounded-lg border p-2">
                          <div className="font-medium">{reward.discountAmount} {t("jod")}</div>
                          <p className="text-xs text-muted-foreground">
                            {t("nextScheduled")}: {new Date(reward.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("noReferralsYet")}</p>
                  )}
                </CardContent>
              </Card>

              {/* Subscription Status Card */}
              {subscription && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("subscriptionTitle")}
                    </CardTitle>
                    <Package2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{t(subscription.status.toLowerCase())}</div>
                    <p className="text-xs text-muted-foreground">
                      {t("nextPayment")}: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                    </p>
                    {subscription.status === "active" ? (
                      <p className="text-xs text-green-500 mt-2">
                        {t("subscriptionActive")}
                      </p>
                    ) : (
                      <Link href="/checkout" className="block mt-2">
                        <Button size="sm" variant="outline" className="flex items-center gap-2 w-full">
                          <CreditCard className="h-4 w-4" />
                          {t("payNow")}
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Notifications Card */}
              <Card className="lg:col-span-3">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("reminders")}
                  </CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <RemindersList limit={3} />
                </CardContent>
              </Card>
            </div>

            {/* Subscribe Card (shown when no subscription exists) */}
            {!subscription && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("welcomeTitle")}</CardTitle>
                  <CardDescription>
                    {t("welcomeSubtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{t("subscriptionBenefits")}</p>
                  <Link href="/checkout">
                    <Button className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {t("subscriptionTitle")} - 25 {t("jod")}/{t("monthly")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}