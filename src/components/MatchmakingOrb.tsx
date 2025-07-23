import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { TranslationKey } from "@/context/LanguageContext";

interface MatchmakingOrbProps {
  userType: "startup" | "investor";
}

const MatchmakingOrb: React.FC<MatchmakingOrbProps> = ({ userType }) => {
  const { t } = useLanguage();
  const message =
    userType === "startup"
      ? t("matchmakingMessageStartup" as TranslationKey)
      : t("matchmakingMessageInvestor" as TranslationKey);

  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS Safari
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      {/* Floating Orb */}
      <div className="relative mb-8">
        {/* Main Orb */}
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-primary/70 shadow-2xl"
          animate={
            isIOS
              ? {
                  // Simple animation for iOS
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1],
                }
              : {
                  // Full animation for other devices
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1],
                }
          }
          transition={{
            duration: isIOS ? 2 : 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Pulsing Rings - Simplified for iOS */}
        {!isIOS && (
          <>
            <motion.div
              className="absolute inset-0 w-32 h-32 rounded-full border-2 border-primary/30"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />

            <motion.div
              className="absolute inset-0 w-32 h-32 rounded-full border border-primary/20"
              animate={{
                scale: [1, 2, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.5,
              }}
            />
          </>
        )}

        {/* Orbiting Elements - Reduced for iOS */}
        {!isIOS && (
          <div className="absolute inset-0">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary/60 rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  transformOrigin: "80px 0px",
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Message */}
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-gradient mb-4">
          {t("matchmakingInProgress" as TranslationKey)}
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {message}
        </p>

        {/* Animated Dots */}
        <motion.div
          className="flex justify-center items-center gap-1 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary rounded-full"
              animate={
                isIOS
                  ? {
                      // Simpler animation for iOS
                      opacity: [0.5, 1, 0.5],
                    }
                  : {
                      // Full animation for other devices
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }
              }
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Background Effects - Simplified for iOS */}
      {!isIOS && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -50, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchmakingOrb;
