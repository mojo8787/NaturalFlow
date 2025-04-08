import { useState, useEffect, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  LayoutDashboard,
  Users,
  FileText,
  Wrench,
  HeadphonesIcon,
  Settings,
  Shield,
  ClipboardList,
  LogOut,
  Menu,
  X,
  BellRing,
  MoonIcon,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location] = useLocation();
  const { admin, logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();
  const { toast } = useToast();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  useEffect(() => {
    // Close sidebar when changing routes on mobile
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [location, isMobile]);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Users", href: "/users", icon: Users },
    { name: "Subscriptions", href: "/subscriptions", icon: FileText },
    { name: "Installations", href: "/installations", icon: Wrench },
    { name: "Support Tickets", href: "/support-tickets", icon: HeadphonesIcon },
    { name: "Admin Users", href: "/admin-users", icon: Shield },
    { name: "Activity Logs", href: "/activity-logs", icon: ClipboardList },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  const toggleDarkMode = () => {
    toast({
      title: "Dark mode is not implemented",
      description: "This feature will be available in a future release.",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 text-neutral-800">
      {/* Sidebar */}
      <aside
        className={`w-64 h-full bg-white shadow-md z-20 transition-all duration-300 fixed md:relative ${
          sidebarOpen ? "" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold">PF</span>
            </div>
            <span className="ml-3 font-bold text-primary">PureFlow Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-neutral-500"
          >
            <X size={20} />
          </button>
        </div>
        <div className="py-4">
          <div className="px-4 py-2 mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary">
                <User size={16} />
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium">{admin?.username}</div>
                <div className="text-xs text-neutral-500">{admin?.role}</div>
              </div>
            </div>
          </div>

          <nav>
            <ul>
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link href={item.href}>
                    <div
                      className={`flex items-center px-4 py-3 hover:bg-neutral-50 cursor-pointer ${
                        isActive(item.href)
                          ? "border-l-3 border-primary bg-primary-50/50 text-primary"
                          : "text-neutral-700"
                      }`}
                    >
                      <item.icon className="w-5 h-5 min-w-5" />
                      <span className="ml-3">{item.name}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="absolute bottom-0 w-full border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-neutral-700 hover:text-primary hover:bg-neutral-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-neutral-50 relative">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm py-3 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mr-4 md:hidden text-neutral-500"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-medium">{title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button size="icon" variant="ghost" className="rounded-full">
              <BellRing size={20} className="text-neutral-600" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full"
              onClick={toggleDarkMode}
            >
              <MoonIcon size={20} className="text-neutral-600" />
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="px-6 py-6">{children}</div>
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
