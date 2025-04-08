import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AdminUser, AdminLoginData } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  admin: AdminUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<{ user: AdminUser; token: string }, Error, AdminLoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: admin,
    error,
    isLoading,
  } = useQuery<AdminUser | undefined, Error>({
    queryKey: ["/api/admin/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: AdminLoginData) => {
      const res = await apiRequest("POST", "/api/admin/login", credentials);
      return await res.json();
    },
    onSuccess: (data: { user: AdminUser; token: string }) => {
      queryClient.setQueryData(["/api/admin/me"], data.user);
      localStorage.setItem("adminToken", data.token);
      
      // Invalidate the query to force a refresh
      queryClient.invalidateQueries({ queryKey: ["/api/admin/me"] });
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/admin/me"], null);
      localStorage.removeItem("adminToken");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        admin: admin ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
