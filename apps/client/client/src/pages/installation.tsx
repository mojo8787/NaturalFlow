import { useQuery, useMutation } from "@tanstack/react-query";
import { Installation } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, Droplet } from "lucide-react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export default function InstallationPage() {
  const { toast } = useToast();
  const { t, dir } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date>();

  const { data: installation, isLoading } = useQuery<Installation>({
    queryKey: ["/api/installation"],
  });

  const scheduleMutation = useMutation({
    mutationFn: async (date: Date) => {
      const res = await apiRequest("POST", "/api/installation", {
        scheduledDate: date.toISOString(),
        status: "scheduled",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/installation"] });
      toast({
        title: t("scheduleInstallation"),
        description: t("scheduleInstallInstructions"),
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold tracking-tight">{t('installation')}</h1>

            {installation ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t('installTitle')}</CardTitle>
                  <CardDescription>
                    {t('scheduledOn')}: {new Date(installation.scheduledDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold capitalize">{t(installation.status.toLowerCase())}</div>
                  {installation.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">{installation.notes}</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t('scheduleInstallation')}</CardTitle>
                  <CardDescription>
                    {t('scheduleInstallInstructions')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                  />
                  <Button
                    className="w-full"
                    disabled={!selectedDate || scheduleMutation.isPending}
                    onClick={() => selectedDate && scheduleMutation.mutate(selectedDate)}
                  >
                    {scheduleMutation.isPending ? t('loading') : t('schedule')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
