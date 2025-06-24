import { supabase } from "./supabase";
import {
  User,
  AuthResponse,
  AuthChangeEvent,
  Session,
} from "@supabase/supabase-js";
import {
  AuthResult,
  AuthError,
  LoginCredentials,
  RegistrationData,
  UserProfile,
  PasswordResetData,
  PasswordUpdateData,
  ProfileUpdateData,
} from "./auth-types";
import { AccountType, accountTypeToRole } from "./account-types";
import {
  validateEmail,
  validatePassword,
  getAuthErrorMessage,
} from "./auth-utils";
import { Investor, Startup } from "./supabase";

// Constants
const PROFILE_TABLES = {
  investor: "investors",
  startup: "startups",
} as const;

// OTP verification result
interface OTPVerificationResult {
  success: boolean;
  user?: User;
  profileId?: string;
  error?: AuthError;
}

// Auth service class
export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private currentProfile: UserProfile | null = null;
  private authListeners: Set<
    (user: User | null, profile: UserProfile | null) => void
  > = new Set();

  private constructor() {
    this.initializeAuth();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Initialize auth state
  private async initializeAuth(): Promise<void> {
    try {
      // Get current session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        return;
      }

      if (session?.user) {
        this.currentUser = session.user;
        await this.loadUserProfile(session.user);
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          await this.handleAuthStateChange(event, session);
        }
      );
    } catch (error) {
      console.error("Error initializing auth:", error);
    }
  }

  // Handle auth state changes
  private async handleAuthStateChange(
    event: AuthChangeEvent,
    session: Session | null
  ): Promise<void> {
    try {
      switch (event) {
        case "SIGNED_IN":
          if (session?.user) {
            this.currentUser = session.user;
            await this.loadUserProfile(session.user);
          }
          break;
        case "SIGNED_OUT":
          this.currentUser = null;
          this.currentProfile = null;
          break;
        case "TOKEN_REFRESHED":
          if (session?.user) {
            this.currentUser = session.user;
            // Profile should remain the same
          }
          break;
        case "USER_UPDATED":
          if (session?.user) {
            this.currentUser = session.user;
            await this.loadUserProfile(session.user);
          }
          break;
      }

      // Notify listeners
      this.notifyAuthListeners();
    } catch (error) {
      console.error("Error handling auth state change:", error);
    }
  }

  // Load user profile based on user metadata
  private async loadUserProfile(user: User): Promise<void> {
    try {
      const accountType = user.user_metadata?.account_type as AccountType;
      const profileId = user.user_metadata?.profile_id;

      if (!accountType || !profileId) {
        // User hasn't completed profile setup
        this.currentProfile = null;
        return;
      }

      // Load profile from appropriate table
      const tableName =
        PROFILE_TABLES[accountType as keyof typeof PROFILE_TABLES];

      if (accountType === "investor") {
        const { data: profileData, error } = await supabase
          .from("investors")
          .select("*")
          .eq("id", profileId)
          .single();

        if (error) {
          console.error("Error loading investor profile:", error);
          this.currentProfile = null;
          return;
        }

        const investorData = profileData as Investor;
        this.currentProfile = {
          id: investorData.id,
          email: investorData.email,
          name: investorData.name,
          accountType: "investor",
          role: "investor",
          isEmailVerified: user.email_confirmed_at !== null,
          createdAt: investorData.created_at,
          updatedAt: investorData.updated_at || investorData.created_at,
          lastLoginAt: user.last_sign_in_at || undefined,
          portfolioSize: undefined, // average_ticket_size is now a string, portfolioSize expects number
          linkedInUrl: investorData.linkedin_profile,
          bio: investorData.strong_candidate_reason,
          phoneNumber: investorData.phone,
          location: investorData.city,
          // Add verification status
          verified: investorData.verified || false,
          adminApproved: investorData.status === "approved",
        };
      } else if (accountType === "startup") {
        const { data: profileData, error } = await supabase
          .from("startups")
          .select("*")
          .eq("id", profileId)
          .single();

        if (error) {
          console.error("Error loading startup profile:", error);
          this.currentProfile = null;
          return;
        }

        const startupData = profileData as Startup;
        this.currentProfile = {
          id: startupData.id,
          email: startupData.email,
          name: startupData.name,
          accountType: "startup",
          role: "startup",
          isEmailVerified: user.email_confirmed_at !== null,
          createdAt: startupData.created_at,
          updatedAt: startupData.updated_at || startupData.created_at,
          lastLoginAt: user.last_sign_in_at || undefined,
          startupId: startupData.id,
          position: "Founder", // Default position
          phoneNumber: startupData.phone,
          // Add verification status
          verified: startupData.verified || false,
          adminApproved: startupData.status === "approved",
        };
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      this.currentProfile = null;
    }
  }

  // Notify auth listeners
  private notifyAuthListeners(): void {
    this.authListeners.forEach((listener) => {
      try {
        listener(this.currentUser, this.currentProfile);
      } catch (error) {
        console.error("Error in auth listener:", error);
      }
    });
  }

  // Public methods

  // Sign up (only for investors and startups)
  public async signUp(
    registrationData: RegistrationData
  ): Promise<AuthResult<{ user: User; needsVerification: boolean }>> {
    try {
      // Validate input
      if (!validateEmail(registrationData.email)) {
        return {
          success: false,
          error: {
            code: "invalid_email",
            message: "Please enter a valid email address",
          },
        };
      }

      const passwordValidation = validatePassword(registrationData.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: {
            code: "weak_password",
            message: passwordValidation.errors.join(", "),
          },
        };
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registrationData.email,
        password: registrationData.password,
        options: {
          data: {
            account_type: registrationData.accountType,
            name: registrationData.name,
            profile_id: null, // Will be set after OTP verification
          },
        },
      });

      if (authError) {
        return {
          success: false,
          error: {
            code: authError.message,
            message: getAuthErrorMessage(authError),
          },
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: { code: "signup_failed", message: "Failed to create account" },
        };
      }

      return {
        success: true,
        data: {
          user: authData.user,
          needsVerification: !authData.user.email_confirmed_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: { code: "signup_error", message: getAuthErrorMessage(error) },
      };
    }
  }

  // Sign up via invitation (simplified - only requires email/password/name)
  public async signUpWithInvite(
    email: string,
    password: string,
    name: string,
    inviteToken: string
  ): Promise<AuthResult<{ user: User; needsVerification: boolean }>> {
    try {
      // Validate input
      if (!validateEmail(email)) {
        return {
          success: false,
          error: {
            code: "invalid_email",
            message: "Please enter a valid email address",
          },
        };
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: {
            code: "weak_password",
            message: passwordValidation.errors.join(", "),
          },
        };
      }

      // Sign up with Supabase Auth (account_type will be 'user' initially)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            account_type: "user",
            name,
            invite_token: inviteToken,
          },
        },
      });

      if (authError) {
        return {
          success: false,
          error: {
            code: authError.message,
            message: getAuthErrorMessage(authError),
          },
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: { code: "signup_failed", message: "Failed to create account" },
        };
      }

      return {
        success: true,
        data: {
          user: authData.user,
          needsVerification: !authData.user.email_confirmed_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: { code: "signup_error", message: getAuthErrorMessage(error) },
      };
    }
  }

  // Verify OTP for invite-based signup and accept invitation
  public async verifyInviteOTP(
    email: string,
    token: string,
    inviteToken: string
  ): Promise<AuthResult<{ user: User; inviteAccepted: boolean }>> {
    try {
      // Verify OTP
      const { data: verifyData, error: verifyError } =
        await supabase.auth.verifyOtp({
          email,
          token,
          type: "email",
        });

      if (verifyError) {
        return {
          success: false,
          error: {
            code: verifyError.message,
            message: getAuthErrorMessage(verifyError),
          },
        };
      }

      if (!verifyData.user) {
        return {
          success: false,
          error: {
            code: "verification_failed",
            message: "Failed to verify OTP",
          },
        };
      }

      // Accept the invite and store the user ID
      const { userInviteService } = await import("./user-invite-service");
      const acceptResult = await userInviteService.acceptInvite(
        inviteToken,
        verifyData.user.id
      );

      if (!acceptResult.success) {
        console.error("Failed to accept invite:", acceptResult.error);
        // Continue anyway as the user has been created and verified
      }

      return {
        success: true,
        data: {
          user: verifyData.user,
          inviteAccepted: acceptResult.success,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "invite_verification_error",
          message: getAuthErrorMessage(error),
        },
      };
    }
  }

  // Verify OTP and create profile
  public async verifyOTP(
    email: string,
    token: string,
    registrationData?: RegistrationData
  ): Promise<AuthResult<OTPVerificationResult>> {
    try {
      // Verify OTP
      const { data: verifyData, error: verifyError } =
        await supabase.auth.verifyOtp({
          email,
          token,
          type: "email",
        });

      if (verifyError) {
        return {
          success: false,
          error: {
            code: verifyError.message,
            message: getAuthErrorMessage(verifyError),
          },
        };
      }

      if (!verifyData.user) {
        return {
          success: false,
          error: {
            code: "verification_failed",
            message: "Failed to verify OTP",
          },
        };
      }

      // If registration data is provided, create the profile
      let profileId: string | undefined;
      if (registrationData) {
        const profileResult = await this.createUserProfile(
          verifyData.user,
          registrationData
        );
        if (!profileResult.success) {
          return {
            success: false,
            error: profileResult.error,
          };
        }
        profileId = profileResult.data?.profileId;

        // Update user metadata with profile ID
        await supabase.auth.updateUser({
          data: {
            ...verifyData.user.user_metadata,
            profile_id: profileId,
          },
        });
      }

      return {
        success: true,
        data: {
          success: true,
          user: verifyData.user,
          profileId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "otp_verification_error",
          message: getAuthErrorMessage(error),
        },
      };
    }
  }

  // Create user profile in appropriate table
  private async createUserProfile(
    user: User,
    registrationData: RegistrationData
  ): Promise<AuthResult<{ profileId: string }>> {
    try {
      const accountType = registrationData.accountType;

      if (accountType === "investor") {
        const investorData: Partial<Investor> = {
          email: user.email!,
          name: registrationData.name,
          created_at: new Date().toISOString(),
          phone: registrationData.phone,
          birthday: registrationData.birthday,
          company: registrationData.company,
          role: registrationData.role,
          country: registrationData.country,
          city: registrationData.city,
          preferred_industries: registrationData.preferredIndustries?.join(","),
          preferred_company_stage: registrationData.preferredStage,
          linkedin_profile: registrationData.linkedinProfile,
          other_social_media_profile: JSON.stringify(
            registrationData.otherSocialMedia || []
          ),
          heard_about_us: registrationData.howDidYouHear,
          number_of_investments: registrationData.numberOfInvestments,
          average_ticket_size: registrationData.averageTicketSize || "",
          secured_lead_investor: registrationData.hasSecuredLeadInvestor,
          participated_as_advisor: registrationData.hasBeenStartupAdvisor,
          strong_candidate_reason: registrationData.whyStrongCandidate,
          verified: false,
          status: "pending",
        };

        const { data: createdProfile, error: createError } = await supabase
          .from("investors")
          .insert(investorData)
          .select()
          .single();

        if (createError) {
          return {
            success: false,
            error: {
              code: createError.code || "profile_creation_error",
              message: getAuthErrorMessage(createError),
            },
          };
        }

        return {
          success: true,
          data: { profileId: createdProfile.id },
        };
      } else if (accountType === "startup") {
        const startupData: Partial<Startup> = {
          email: user.email!,
          name: registrationData.name,
          founder_info: registrationData.name,
          created_at: new Date().toISOString(),
          phone: registrationData.phone,
          startup_name: registrationData.startupName,
          website: registrationData.website,
          industry: registrationData.industry || "",
          stage: registrationData.stage as
            | "Idea"
            | "MVP"
            | "Scaling"
            | undefined,
          logo: registrationData.logoUrl,
          social_media_accounts: JSON.stringify(
            registrationData.socialMediaAccounts || []
          ),
          problem_solving: registrationData.problemSolving,
          solution: registrationData.solutionDescription,
          uniqueness: registrationData.uniqueValueProposition,
          previous_financial_year_revenue: registrationData.currentRevenue,
          has_received_funding: registrationData.hasReceivedFunding,
          monthly_burn_rate: registrationData.monthlyBurnRate,
          investment_instrument: registrationData.investmentInstrument as
            | "Equity"
            | "Convertible note"
            | "SAFE"
            | "Loan"
            | "Other"
            | "Undecided"
            | "Not interested in funding"
            | undefined,
          capital_seeking: registrationData.capitalSeeking,
          pre_money_valuation: registrationData.preMoneyValuation,
          funding_already_raised: registrationData.fundingAlreadyRaised,
          pitch_deck: registrationData.pitchDeckUrl,
          co_founders: JSON.stringify(registrationData.coFounders || []),
          calendly_link: registrationData.calendlyLink,
          video_link: registrationData.videoLink,
          team_size: registrationData.teamSize,
          achievements: registrationData.achievements,
          risks: registrationData.risksAndMitigation,
          risk_mitigation: registrationData.risksAndMitigation,
          exit_strategy: registrationData.exitStrategy as
            | "Competitor buyout"
            | "Company buyout"
            | "Shareholder/employee buyout"
            | "IPO/RPO"
            | undefined,
          participated_in_accelerator: registrationData.participatedAccelerator,
          additional_files: JSON.stringify(
            registrationData.additionalFiles || []
          ),
          verified: false,
          status: "pending",
        };

        const { data: createdProfile, error: createError } = await supabase
          .from("startups")
          .insert(startupData)
          .select()
          .single();

        if (createError) {
          return {
            success: false,
            error: {
              code: createError.code || "profile_creation_error",
              message: getAuthErrorMessage(createError),
            },
          };
        }

        return {
          success: true,
          data: { profileId: createdProfile.id },
        };
      }

      return {
        success: false,
        error: {
          code: "invalid_account_type",
          message: "Invalid account type",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "profile_creation_error",
          message: getAuthErrorMessage(error),
        },
      };
    }
  }

  // Resend OTP
  public async resendOTP(email: string): Promise<AuthResult<void>> {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        return {
          success: false,
          error: { code: error.message, message: getAuthErrorMessage(error) },
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "resend_otp_error",
          message: getAuthErrorMessage(error),
        },
      };
    }
  }

  // Sign in
  public async signIn(
    credentials: LoginCredentials
  ): Promise<AuthResult<{ user: User; profile: UserProfile | null }>> {
    try {
      if (!validateEmail(credentials.email)) {
        return {
          success: false,
          error: {
            code: "invalid_email",
            message: "Please enter a valid email address",
          },
        };
      }

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

      if (authError) {
        return {
          success: false,
          error: {
            code: authError.message,
            message: getAuthErrorMessage(authError),
          },
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: { code: "signin_failed", message: "Failed to sign in" },
        };
      }

      // Load user profile
      await this.loadUserProfile(authData.user);

      return {
        success: true,
        data: {
          user: authData.user,
          profile: this.currentProfile,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: { code: "signin_error", message: getAuthErrorMessage(error) },
      };
    }
  }

  // Sign out
  public async signOut(): Promise<AuthResult<void>> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: { code: error.message, message: getAuthErrorMessage(error) },
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: { code: "signout_error", message: getAuthErrorMessage(error) },
      };
    }
  }

  // Reset password
  public async resetPassword(
    data: PasswordResetData
  ): Promise<AuthResult<void>> {
    try {
      if (!validateEmail(data.email)) {
        return {
          success: false,
          error: {
            code: "invalid_email",
            message: "Please enter a valid email address",
          },
        };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return {
          success: false,
          error: { code: error.message, message: getAuthErrorMessage(error) },
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "password_reset_error",
          message: getAuthErrorMessage(error),
        },
      };
    }
  }

  // Update password
  public async updatePassword(
    data: PasswordUpdateData
  ): Promise<AuthResult<void>> {
    try {
      const passwordValidation = validatePassword(data.newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: {
            code: "weak_password",
            message: passwordValidation.errors.join(", "),
          },
        };
      }

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        return {
          success: false,
          error: { code: error.message, message: getAuthErrorMessage(error) },
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "password_update_error",
          message: getAuthErrorMessage(error),
        },
      };
    }
  }

  // Update profile
  public async updateProfile(
    data: ProfileUpdateData
  ): Promise<AuthResult<UserProfile>> {
    try {
      if (!this.currentUser || !this.currentProfile) {
        return {
          success: false,
          error: {
            code: "not_authenticated",
            message: "User not authenticated",
          },
        };
      }

      const accountType = this.currentProfile.accountType;
      const profileId = this.currentProfile.id;

      if (accountType === "investor") {
        // Prepare update data for investor
        const updateData: Partial<Investor> = {};

        if (data.name) updateData.name = data.name;
        if (data.phoneNumber) updateData.phone = data.phoneNumber;
        if (data.location) updateData.city = data.location;
        if (data.bio) updateData.strong_candidate_reason = data.bio;
        if (data.linkedInUrl) updateData.linkedin_profile = data.linkedInUrl;

        // Update profile in database
        const { data: updatedProfile, error: updateError } = await supabase
          .from("investors")
          .update(updateData)
          .eq("id", profileId)
          .select()
          .single();

        if (updateError) {
          return {
            success: false,
            error: {
              code: updateError.code || "profile_update_error",
              message: getAuthErrorMessage(updateError),
            },
          };
        }
      } else if (accountType === "startup") {
        // Prepare update data for startup
        const updateData: Partial<Startup> = {};

        if (data.name) updateData.name = data.name;
        if (data.phoneNumber) updateData.phone = data.phoneNumber;

        // Update profile in database
        const { data: updatedProfile, error: updateError } = await supabase
          .from("startups")
          .update(updateData)
          .eq("id", profileId)
          .select()
          .single();

        if (updateError) {
          return {
            success: false,
            error: {
              code: updateError.code || "profile_update_error",
              message: getAuthErrorMessage(updateError),
            },
          };
        }
      }

      // Update auth metadata if name changed
      if (data.name) {
        await supabase.auth.updateUser({
          data: {
            ...this.currentUser.user_metadata,
            name: data.name,
          },
        });
      }

      // Reload profile
      await this.loadUserProfile(this.currentUser);

      return {
        success: true,
        data: this.currentProfile!,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "profile_update_error",
          message: getAuthErrorMessage(error),
        },
      };
    }
  }

  // Get current user
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get current profile
  public getCurrentProfile(): UserProfile | null {
    return this.currentProfile;
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Check if email is verified
  public isEmailVerified(): boolean {
    return this.currentUser?.email_confirmed_at !== null;
  }

  // Add auth state listener
  public addAuthListener(
    listener: (user: User | null, profile: UserProfile | null) => void
  ): () => void {
    this.authListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.authListeners.delete(listener);
    };
  }

  // Refresh session
  public async refreshSession(): Promise<AuthResult<void>> {
    try {
      const { error } = await supabase.auth.refreshSession();

      if (error) {
        return {
          success: false,
          error: { code: error.message, message: getAuthErrorMessage(error) },
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "session_refresh_error",
          message: getAuthErrorMessage(error),
        },
      };
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Export helper functions
export const useAuth = () => {
  return {
    user: authService.getCurrentUser(),
    profile: authService.getCurrentProfile(),
    isAuthenticated: authService.isAuthenticated(),
    isEmailVerified: authService.isEmailVerified(),
    signUp: authService.signUp.bind(authService),
    verifyOTP: authService.verifyOTP.bind(authService),
    resendOTP: authService.resendOTP.bind(authService),
    signIn: authService.signIn.bind(authService),
    signOut: authService.signOut.bind(authService),
    resetPassword: authService.resetPassword.bind(authService),
    updatePassword: authService.updatePassword.bind(authService),
    updateProfile: authService.updateProfile.bind(authService),
    refreshSession: authService.refreshSession.bind(authService),
    addAuthListener: authService.addAuthListener.bind(authService),
  };
};
