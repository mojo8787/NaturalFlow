import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from "@/hooks/use-language";
import { Loader2, Droplets, Leaf, BarChart3, Save, RefreshCw } from "lucide-react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { MobileNav } from "@/components/layout/mobile-nav";

// Form schema for water usage input
const waterUsageFormSchema = z.object({
  litresUsed: z.string().min(1, "Water usage is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0, 
    { message: "Water usage must be a positive number" }
  ),
  date: z.string().optional()
});

type WaterUsageFormData = z.infer<typeof waterUsageFormSchema>;

export default function EcoImpactPage() {
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [refreshInterval, setRefreshInterval] = useState<number | false>(false);
  
  // Form for recording water usage
  const form = useForm<WaterUsageFormData>({
    resolver: zodResolver(waterUsageFormSchema),
    defaultValues: {
      litresUsed: "",
    },
  });
  
  // Define types for API responses
  interface EcoImpactData {
    id: number;
    userId: number;
    plasticBottlesSaved: number;
    co2Reduced: string;
    waterSaved: string;
    lastCalculatedAt: string;
  }
  
  interface WaterUsageData {
    id: number;
    userId: number;
    date: string;
    litresUsed: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Query to fetch eco impact data
  const { 
    data: ecoImpact, 
    isLoading: isEcoImpactLoading,
    refetch: refetchEcoImpact
  } = useQuery<EcoImpactData>({
    queryKey: ["/api/eco-impact"],
    refetchInterval: refreshInterval,
  });
  
  // Query to fetch water usage history
  const { 
    data: waterUsage,
    isLoading: isWaterUsageLoading,
    refetch: refetchWaterUsage
  } = useQuery<WaterUsageData[]>({
    queryKey: ["/api/water-usage"],
    refetchInterval: refreshInterval,
  });
  
  // Mutation to record new water usage
  const recordUsageMutation = useMutation({
    mutationFn: async (data: WaterUsageFormData) => {
      const res = await apiRequest("POST", "/api/water-usage", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to record water usage");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Water usage recorded",
        description: "Your water usage has been successfully recorded.",
      });
      
      // Reset form
      form.reset({
        litresUsed: "",
      });
      
      // Refetch eco impact and water usage data
      refetchEcoImpact();
      refetchWaterUsage();
    },
    onError: (error: Error) => {
      toast({
        title: "Error recording water usage",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation to force recalculate eco impact
  const recalculateEcoImpactMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/eco-impact/calculate");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to recalculate eco impact");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Eco impact recalculated",
        description: "Your environmental impact statistics have been recalculated.",
      });
      
      // Refetch eco impact data
      refetchEcoImpact();
    },
    onError: (error: Error) => {
      toast({
        title: "Error recalculating eco impact",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Function to handle form submission
  const onSubmit = (data: WaterUsageFormData) => {
    recordUsageMutation.mutate(data);
  };
  
  // Prepare chart data for water usage
  const chartData = waterUsage && waterUsage.length > 0
    ? waterUsage.map((usage: any) => ({
        date: new Date(usage.date).toLocaleDateString(),
        litres: Number(usage.litresUsed),
      })).slice(-7) // Show last 7 entries
    : [];
  
  // When no impact data is available, show a getting started message
  const showGettingStarted = !isEcoImpactLoading && (!ecoImpact || !waterUsage || waterUsage.length === 0);

  return (
    <div className="flex min-h-screen flex-col" dir={dir}>
      {/* Mobile navigation */}
      <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
        <MobileNav />
        <h1 className="flex-1 text-xl font-bold">
          {t("Environmental Impact")}
        </h1>
      </div>
      
      {/* Main content */}
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <DashboardNav className="hidden border-r md:block" />
        
        <main className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                {t("Environmental Impact")}
              </h1>
              <p className="text-muted-foreground">
                {t("Track your water usage and environmental contribution")}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => recalculateEcoImpactMutation.mutate()}
                    disabled={recalculateEcoImpactMutation.isPending || showGettingStarted}>
              {recalculateEcoImpactMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {t("Recalculate")}
            </Button>
          </div>
          
          {/* Getting started section */}
          {showGettingStarted && (
            <Card>
              <CardHeader>
                <CardTitle>{t("Getting Started")}</CardTitle>
                <CardDescription>
                  {t("Record your daily water usage to see your environmental impact")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p>
                  {t("By using a PureFlow water filtration system, you're already contributing to environmental sustainability. Record your water usage to track your positive impact.")}
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    <span>{t("Reduced plastic bottle waste")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-500" />
                    <span>{t("Lower carbon footprint")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Save className="h-5 w-5 text-teal-500" />
                    <span>{t("Water conservation")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Impact stats */}
          {!showGettingStarted && ecoImpact && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="overflow-hidden">
                <CardHeader className="bg-blue-50 dark:bg-blue-950">
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    {t("Plastic Bottles Saved")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold">
                    {isEcoImpactLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>{ecoImpact.plasticBottlesSaved.toLocaleString()}</>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("500ml plastic bottles")}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="bg-green-50 dark:bg-green-950">
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-500" />
                    {t("CO2 Reduction")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold">
                    {isEcoImpactLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>{ecoImpact.co2Reduced} kg</>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("Carbon dioxide emissions")}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="bg-teal-50 dark:bg-teal-950">
                  <CardTitle className="flex items-center gap-2">
                    <Save className="h-5 w-5 text-teal-500" />
                    {t("Water Saved")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold">
                    {isEcoImpactLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>{ecoImpact.waterSaved} L</>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("In production processes")}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Water usage form */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Record Water Usage")}</CardTitle>
              <CardDescription>
                {t("Enter the amount of filtered water you've used")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="litresUsed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Amount (Litres)")}</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.1" placeholder="0.0" {...field} />
                        </FormControl>
                        <FormDescription>
                          {t("Enter the volume of filtered water used in litres")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Date (optional)")}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          {t("Leave empty to use today's date")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={recordUsageMutation.isPending}>
                    {recordUsageMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Droplets className="mr-2 h-4 w-4" />
                    )}
                    {t("Record Usage")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* Water usage chart */}
          {!showGettingStarted && waterUsage && waterUsage.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t("Water Usage History")}
                </CardTitle>
                <CardDescription>
                  {t("Your last 7 water usage records")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {isWaterUsageLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="date" />
                        <YAxis label={{ value: 'Litres', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="litres" name="Litres Used">
                          {chartData.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill="#3b82f6" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Last calculated info */}
          {!showGettingStarted && ecoImpact && (
            <div className="text-sm text-muted-foreground text-center">
              {t("Last calculated")}: {new Date(ecoImpact.lastCalculatedAt).toLocaleString()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}