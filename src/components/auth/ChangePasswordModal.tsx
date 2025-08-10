import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { signupTranslations } from "@/utils/language";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangePasswordModal = ({
  open,
  onOpenChange,
}: ChangePasswordModalProps) => {
  const [changeError, setChangeError] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const { updatePassword } = useAuth();
  const { language } = useLanguage();

  // Helper function to get translated text
  const t = (key: keyof typeof signupTranslations) => {
    return signupTranslations[key][language];
  };

  const formSchema = z
    .object({
      currentPassword: z.string().min(1, t("currentPasswordRequired")),
      newPassword: z.string().min(6, t("passwordMinLength")),
      confirmPassword: z.string().min(6, t("passwordMinLength")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsChanging(true);
      setChangeError("");

      const success = await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (success) {
        // Reset form and close modal
        form.reset();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Password change error:", error);
      setChangeError(
        error instanceof Error ? error.message : "Failed to change password"
      );
    } finally {
      setIsChanging(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setChangeError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("changePasswordTitle")}</DialogTitle>
          <DialogDescription>
            {t("changePasswordDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {changeError && (
            <Alert variant="destructive">
              <AlertDescription>{changeError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("currentPasswordLabel").replace(" *", "")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isChanging}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("newPasswordLabel").replace(" *", "")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isChanging}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("confirmNewPasswordLabel").replace(" *", "")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isChanging}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isChanging}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isChanging}>
                  {isChanging ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      {t("updatingPassword")}
                    </>
                  ) : (
                    t("updatePasswordButton")
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
