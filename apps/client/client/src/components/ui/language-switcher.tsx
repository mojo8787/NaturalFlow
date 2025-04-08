import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { Languages } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Languages className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-accent' : ''}>
          <span className="font-medium">English</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('ar')} className={language === 'ar' ? 'bg-accent' : ''}>
          <span className="font-medium">العربية</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}