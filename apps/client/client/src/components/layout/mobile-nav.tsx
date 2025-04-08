import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Wrench,
  LifeBuoy,
  User,
  Menu,
  LogOut,
  Leaf,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useState } from "react";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { t, dir } = useLanguage();
  const { logoutMutation } = useAuth();
  const [location] = useLocation();

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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={dir === 'rtl' ? 'right' : 'left'}>
        <SheetHeader>
          <SheetTitle>PureFlow</SheetTitle>
        </SheetHeader>
        <div className="grid gap-2 py-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                {item.icon}
                <span className="ms-3">{item.title}</span>
              </Button>
            </Link>
          ))}

          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50"
            onClick={() => {
              logoutMutation.mutate();
              setOpen(false);
            }}
          >
            <LogOut className="h-5 w-5" />
            <span className="ms-3">{t("Logout")}</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}