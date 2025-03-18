
import { BackgroundPaths } from "@/components/ui/background-paths";
import { useTheme } from "@/components/ThemeProvider";

const HeroSection = () => {
  const { theme } = useTheme();

  return (
    <div className={theme}>
      <BackgroundPaths 
        title="Get funded in days, not months." 
        subtitle="We'll connect you to the best investors in MENA who believe in your potential."
        buttonText="Submit Your Pitch"
        buttonLink="/pitch"
        secondaryButtonText="Join as Investor"
        secondaryButtonLink="#investor-registration"
      />
    </div>
  );
};

export default HeroSection;
