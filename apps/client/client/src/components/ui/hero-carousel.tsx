import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

// Ad data type
export type AdItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string;
};

interface HeroCarouselProps {
  ads: AdItem[];
  className?: string;
  autoplay?: boolean;
  interval?: number; // in milliseconds
}

export function HeroCarousel({
  ads,
  className = "",
  autoplay = true,
  interval = 5000,
}: HeroCarouselProps) {
  const { dir } = useLanguage();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Autoplay functionality
  useEffect(() => {
    if (autoplay && api) {
      const timer = setInterval(() => {
        api.scrollNext();
      }, interval);

      return () => {
        clearInterval(timer);
      };
    }
  }, [api, autoplay, interval]);

  return (
    <div className={`w-full ${className}`} dir={dir}>
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {ads.map((ad) => (
            <CarouselItem key={ad.id}>
              <div className="p-1">
                <Card className="overflow-hidden border-0 rounded-xl shadow-md">
                  <CardContent className="flex flex-col items-center justify-center p-0">
                    <div className="relative w-full">
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="w-full h-[300px] object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">{ad.title}</h3>
                        <p className="text-base md:text-lg">{ad.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
      <div className="flex justify-center mt-2 gap-1">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            onClick={() => api?.scrollTo(i)}
            className={`w-2 h-2 rounded-full ${
              i === current - 1 ? "bg-primary" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}