import { BackgroundPaths } from "@/components/ui/background-paths";
import { useLanguage } from "@/context/LanguageContext";
import { homeTranslations } from "@/utils/language/home";
import { User } from "@/lib/simple-auth-service";

const HeroSection = ({ user }: { user: User | null }) => {
  const { language } = useLanguage();
  return (
    <BackgroundPaths
      title={homeTranslations.heroTitle[language]}
      subtitle={homeTranslations.heroSubtitle[language]}
      buttonText={homeTranslations.heroButton[language]}
      buttonLink="/signup"
      user={user}
    />
  );
};

export default HeroSection;
