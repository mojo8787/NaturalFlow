import { useAuth } from "@/hooks/use-auth";
import type { LoginData } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplet } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { t, dir } = useLanguage();

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, password: true })),
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
  });

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-6 lg:p-8" dir={dir}>
      <div className="flex justify-end mb-4">
        <LanguageSwitcher />
      </div>
      <div className="container mx-auto grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Droplet className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold">PureFlow</h1>
          </div>

          <div className="prose">
            <h2>{t("welcomeTitle")}</h2>
            <p>
              {t("welcomeSubtitle")}
            </p>
            <ul>
              <li>{t("scheduleInstallation")}</li>
              <li>{t("subscriptionTitle")}</li>
              <li>{t("supportTitle")}</li>
              <li>{t("referralTitle")}</li>
            </ul>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("welcomeBack")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("login")}</TabsTrigger>
                <TabsTrigger value="register">{t("register")}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data as LoginData))} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("username")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("password")}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? t("loading") : t("login")}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data as InsertUser))} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("username")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("password")}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("phoneNumber")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("address")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="referralCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("referralCode")}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t("referralInstructions")} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? t("creating") : t("createAccount")}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}