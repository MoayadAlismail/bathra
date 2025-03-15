
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";

function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        color: `rgba(15,23,42,${0.1 + i * 0.03})`,
        width: 0.5 + i * 0.03,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-white opacity-30"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.03}
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

interface BackgroundPathsProps {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
}

export function BackgroundPaths({
    title = "Transform Your Vision Into Reality",
    subtitle = "Get funded. Invest wisely. Build the future together with strategic partners who believe in your potential.",
    buttonText = "Discover Excellence",
    buttonLink = "/pitch"
}: BackgroundPathsProps) {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const words = title.split(" ");

    const handleButtonClick = () => {
        navigate(buttonLink);
    };

    return (
        <div className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-background">
            <div className="absolute inset-0">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
                        {words.map((word, wordIndex) => (
                            <span
                                key={wordIndex}
                                className="inline-block mr-4 last:mr-0"
                            >
                                {word.split("").map((letter, letterIndex) => (
                                    <motion.span
                                        key={`${wordIndex}-${letterIndex}`}
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay:
                                                wordIndex * 0.1 +
                                                letterIndex * 0.03,
                                            type: "spring",
                                            stiffness: 150,
                                            damping: 25,
                                        }}
                                        className={`inline-block text-transparent bg-clip-text ${
                                          theme === 'light' 
                                            ? 'bg-gradient-to-r from-primary to-primary/80' 
                                            : 'bg-gradient-to-r from-white to-white/80'
                                        }`}
                                    >
                                        {letter}
                                    </motion.span>
                                ))}
                            </span>
                        ))}
                    </h1>
                    
                    {subtitle && (
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5, duration: 0.8 }}
                            className="text-lg md:text-xl text-foreground mb-12 max-w-2xl mx-auto"
                        >
                            {subtitle}
                        </motion.p>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2, duration: 0.8 }}
                    >
                        <div
                            className={`inline-block group relative p-px rounded-2xl backdrop-blur-lg 
                            overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                              theme === 'light' 
                                ? 'bg-gradient-to-b from-primary/20 to-primary/10 border border-primary/30' 
                                : 'bg-gradient-to-b from-white/10 to-black/10 border border-white/10'
                            }`}
                        >
                            <Button
                                variant="ghost"
                                onClick={handleButtonClick}
                                className={`rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                                transition-all duration-300 group-hover:-translate-y-0.5 
                                hover:shadow-md ${
                                  theme === 'light'
                                    ? 'bg-primary/95 hover:bg-primary/100 text-white hover:shadow-primary/20'
                                    : 'bg-black/95 hover:bg-black/100 text-white hover:shadow-white/10 border border-white/10'
                                }`}
                            >
                                <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                                    {buttonText}
                                </span>
                                <span
                                    className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                    transition-all duration-300"
                                >
                                    →
                                </span>
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
