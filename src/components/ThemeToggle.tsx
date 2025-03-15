
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className={`relative w-10 h-10 rounded-full glass ${
        theme === 'light' ? 'bg-primary/10' : 'bg-primary/20'
      }`}
      aria-label="Toggle theme"
    >
      <Sun className={`h-5 w-5 absolute transition-all ${theme === 'dark' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} text-primary`} />
      <Moon className={`h-5 w-5 absolute transition-all ${theme === 'light' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} text-primary-foreground`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
