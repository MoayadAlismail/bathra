
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type BackgroundPathsProps = {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
};

export function BackgroundPaths({ 
  title, 
  subtitle, 
  buttonText, 
  buttonLink,
  secondaryButtonText,
  secondaryButtonLink
}: BackgroundPathsProps) {
  return (
    <div className="relative">
      <svg
        className="absolute inset-0 w-full h-full"
        width="800"
        height="auto"
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="paint0_linear" x1="0" y1="0" x2="800" y2="600" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(139,69,19,0.4)" />
            <stop offset="1" stopColor="rgba(139,69,19,0.1)" />
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#paint0_linear)" />
        <path
          d="M0 0L800 600H0V0Z"
          fill="url(#paint0_linear)"
        />
        <path
          d="M0 600L800 0V600H0Z"
          fill="url(#paint0_linear)"
        />
      </svg>
      <div className="absolute inset-0">
        <div className="container px-4 pt-40 lg:pt-60 pb-32 mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center text-primary-foreground animate-fade-in">
          <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 text-gradient">
            {title}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-primary-foreground/80 max-w-3xl mx-auto">
            {subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-base sm:text-lg py-6">
              <Link to={buttonLink}>
                {buttonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            {secondaryButtonText && secondaryButtonLink && (
              <Button asChild size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 text-primary text-base sm:text-lg py-6">
                <a href={secondaryButtonLink}>
                  {secondaryButtonText}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
