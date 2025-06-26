import { BackgroundPaths } from "@/components/ui/background-paths";
import { User } from "@/lib/simple-auth-service";

const HeroSection = ({ user }: { user: User | null }) => {
  return (
    <BackgroundPaths
      title="Get funded in days, not months."
      subtitle="Send us your pitch, and forget the rest. We'll connect you to the best investors in MENA who believe in your potential."
      buttonText="Pitch Your Startup"
      buttonLink="/signup"
      user={user}
    />
  );
};

export default HeroSection;
