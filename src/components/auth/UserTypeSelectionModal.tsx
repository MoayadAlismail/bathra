import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building, Briefcase, Users, TrendingUp } from "lucide-react";

interface UserTypeSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserTypeSelectionModal({
  open,
  onOpenChange,
}: UserTypeSelectionModalProps) {
  const [selectedType, setSelectedType] = useState<
    "startup" | "investor" | null
  >(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedType === "startup") {
      navigate("/signup/startup");
    } else if (selectedType === "investor") {
      navigate("/signup/investor");
    }
    onOpenChange(false);
  };

  const userTypes = [
    {
      type: "startup" as const,
      title: "Startup Founder",
      description: "I'm building a startup and looking for investors",
      icon: Building,
      features: [
        "Create your startup profile",
        "Connect with potential investors",
        "Showcase your pitch deck",
        "Track funding progress",
      ],
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      type: "investor" as const,
      title: "Investor",
      description: "I want to invest in promising startups",
      icon: Briefcase,
      features: [
        "Browse vetted startups",
        "Access detailed startup profiles",
        "Connect with founders",
        "Manage your investment portfolio",
      ],
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Account Type
          </DialogTitle>
          <DialogDescription className="text-center">
            Select the option that best describes you to get started with Bathra
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {userTypes.map((userType) => {
            const Icon = userType.icon;
            const isSelected = selectedType === userType.type;

            return (
              <motion.div
                key={userType.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`
                  relative p-6 rounded-lg border-2 cursor-pointer transition-all
                  ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20"
                      : userType.color
                  }
                `}
                onClick={() => setSelectedType(userType.type)}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div
                    className={`p-3 rounded-full bg-white ${userType.iconColor}`}
                  >
                    <Icon className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">{userType.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {userType.description}
                    </p>
                  </div>

                  <ul className="space-y-2 text-sm">
                    {userType.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center mt-8">
          <Button
            onClick={handleContinue}
            disabled={!selectedType}
            size="lg"
            className="px-8"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
