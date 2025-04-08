import { AdItem } from "@/components/ui/hero-carousel";

// Sample ads in both English and Arabic
const ads: Record<string, AdItem[]> = {
  en: [
    {
      id: "ad1",
      title: "Pure Water, One Tap Away",
      description: "Subscribe today for clean water for your family",
      imageUrl: "/images/family-ro-water.png",
    },
    {
      id: "ad2",
      title: "Order. Install. Relax.",
      description: "Professional installation by our certified technicians",
      imageUrl: "/images/technician-ro-install.png",
    },
    {
      id: "ad3",
      title: "Refer a Friend",
      description: "Refer a friend and get a free month of service",
      imageUrl: "/images/family-ro-water.png",
    },
  ],
  ar: [
    {
      id: "ad1",
      title: "نقاء الماء بلمسة زر",
      description: "اشترك الآن للحصول على مياه نقية لعائلتك",
      imageUrl: "/images/family-ro-water.png",
    },
    {
      id: "ad2",
      title: "وصب. ركب. ارتاح",
      description: "تركيب احترافي من قبل فنيينا المعتمدين",
      imageUrl: "/images/technician-ro-install.png",
    },
    {
      id: "ad3",
      title: "إحالة صديق",
      description: "قم بإحالة صديق واحصل على شهر مجاني من الخدمة",
      imageUrl: "/images/family-ro-water.png",
    },
  ],
};

// Function to get ads based on language
export function getAds(language: string = 'en'): AdItem[] {
  return ads[language as keyof typeof ads] || ads.en;
}