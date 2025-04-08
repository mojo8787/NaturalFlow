import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "super_admin", "support", "technician"]),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { admin, loginMutation } = useAuth();
  
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        window.location.href = '/';
      }
    });
  };

  // If user is already logged in, redirect to dashboard
  if (admin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold">PF</span>
              </div>
              <h2 className="ml-3 text-2xl font-bold text-gray-900">PureFlow Admin</h2>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Login to access the admin dashboard
            </p>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-1 w-full mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access the dashboard
                  </CardDescription>
                </CardHeader>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        {...loginForm.register("username")}
                        placeholder="Enter your username"
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        {...loginForm.register("password")}
                        placeholder="Enter your password"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-700">
          <div className="flex flex-col h-full items-start justify-center px-16">
            <h1 className="text-4xl font-bold text-white mb-6">PureFlow Admin Dashboard</h1>
            <p className="text-primary-100 text-xl max-w-md">
              Manage users, subscriptions, installations, and support tickets all in one place.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 max-w-xl">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-white text-4xl font-bold mb-1">✓</div>
                <h3 className="text-white font-medium">User Management</h3>
                <p className="text-primary-100 text-sm">View and manage customer accounts</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-white text-4xl font-bold mb-1">✓</div>
                <h3 className="text-white font-medium">Installation Tracking</h3>
                <p className="text-primary-100 text-sm">Manage installation schedules</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-white text-4xl font-bold mb-1">✓</div>
                <h3 className="text-white font-medium">Support Tickets</h3>
                <p className="text-primary-100 text-sm">Track and resolve customer issues</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-white text-4xl font-bold mb-1">✓</div>
                <h3 className="text-white font-medium">Analytics</h3>
                <p className="text-primary-100 text-sm">Review service performance metrics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
