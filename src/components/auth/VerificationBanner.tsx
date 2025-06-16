import { AlertTriangle, Clock, CheckCircle, XCircle, Flag } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/lib/auth-types";
import { checkUserVerification } from "@/lib/auth-middleware";

interface VerificationBannerProps {
  profile: UserProfile | null;
  className?: string;
}

const VerificationBanner = ({
  profile,
  className = "",
}: VerificationBannerProps) => {
  if (!profile) return null;

  const verification = checkUserVerification(profile);

  // Don't show banner if user is fully verified
  if (verification.canAccessFeature) return null;

  const getAlertVariant = () => {
    switch (profile.status) {
      case "rejected":
        return "destructive";
      case "flagged":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusIcon = () => {
    switch (profile.status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "flagged":
        return <Flag className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (profile.status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "flagged":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getActionButton = () => {
    switch (profile.status) {
      case "rejected":
        return (
          <Button size="sm" variant="outline">
            Contact Support
          </Button>
        );
      case "flagged":
        return (
          <Button size="sm" variant="outline">
            Contact Support
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Alert variant={getAlertVariant()} className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        Account Verification Status
        <Badge className={getStatusColor()}>
          {getStatusIcon()}
          {profile.status || "pending"}
        </Badge>
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{verification.message}</span>
        {getActionButton()}
      </AlertDescription>
    </Alert>
  );
};

export default VerificationBanner;
