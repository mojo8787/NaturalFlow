import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  LayoutDashboard,
  Wrench,
  LifeBuoy,
  User,
  Droplets,
  Leaf,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface NavProps {
  className?: string;
}

export function DashboardNav({ className }: NavProps) {
  const { t } = useLanguage();

  const navItems = [
    {
      title: t("Dashboard"),
      href: "/",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: t("Installation"),
      href: "/installation",
      icon: <Wrench className="w-5 h-5" />,
    },
    {
      title: t("Environmental Impact"),
      href: "/eco-impact",
      icon: <Leaf className="w-5 h-5" />,
    },
    {
      title: t("Support"),
      href: "/support",
      icon: <LifeBuoy className="w-5 h-5" />,
    },
    {
      title: t("Profile"),
      href: "/profile",
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <nav className={cn("flex flex-col space-y-1 p-4", className)}>
      {navItems.map((item) => {
        const isActive = window.location.pathname === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                buttonVariants({ variant: "ghost" }),
                isActive
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start"
              )}
            >
              {item.icon}
              <span className="ms-3">{item.title}</span>
            </a>
          </Link>
        );
      })}
    </nav>
  );
}