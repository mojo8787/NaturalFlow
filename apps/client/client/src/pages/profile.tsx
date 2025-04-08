import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Droplet, User, Phone, MapPin } from "lucide-react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User as UserType } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

// Profile update schema
const profileUpdateSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().optional(),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const { t, dir } = useLanguage();
  const { user } = useAuth();
  
  const form = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      username: user?.username || "",
      phone: user?.phone || "",
      address: user?.address || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: (data: UserType) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: t("success"),
        description: t("profileUpdated"),
      });
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user) {
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

          <main className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">{t("profile")}</h1>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("profileSettings")}</CardTitle>
                  <CardDescription>{t("updateProfileSettings")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form 
                      onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))} 
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("username")}</FormLabel>
                            <FormControl>
                              <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                </span>
                                <Input className="rounded-l-none" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("phoneNumber")}</FormLabel>
                            <FormControl>
                              <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                </span>
                                <Input className="rounded-l-none" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("address")}</FormLabel>
                            <FormControl>
                              <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                </span>
                                <Input className="rounded-l-none" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={updateProfileMutation.isPending || !form.formState.isDirty}
                      >
                        {updateProfileMutation.isPending ? t("loading") : t("save")}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("accountInfo")}</CardTitle>
                  <CardDescription>{t("yourAccountDetails")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">{t("memberSince")}</h3>
                    <p>{new Date().toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">{t("referralCode")}</h3>
                    <p className="font-mono">{user.referralCode || "N/A"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">{t("subscriptionStatus")}</h3>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <p>{t("active")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}