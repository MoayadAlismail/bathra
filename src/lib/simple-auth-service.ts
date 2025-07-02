import { supabase } from "./supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { AccountType } from "./account-types";
import { RegistrationData, LoginCredentials } from "./auth-types";
import { Investor, Startup } from "./supabase";

// Simple user interface for our app
export interface User {
  id: string;
  email: string;
  name: string;
  accountType: AccountType;
  created_at: string;
  isProfileComplete: boolean;
}

// Signup credentials
export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
  accountType: AccountType;
}

// OTP verification credentials
export interface OTPVerificationCredentials {
  email: string;
  token: string;
  registrationData?: RegistrationData;
}

class SimpleAuthService {
  async signUp(credentials: SignUpCredentials): Promise<{
    user: User & { identities?: unknown[] };
    emailVerificationSent: boolean;
  }> {
    // Create account with password
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
          account_type: credentials.accountType,
        },
      },
    });

    if (error) throw error;

    // Check if this is an existing user (identities array will be empty)
    const isExistingUser =
      data.user?.identities && data.user.identities.length === 0;

    if (isExistingUser) {
      console.log("User already exists with this email");
    }

    // Return a user object with identities information included
    return {
      user: {
        id: data.user?.id || "",
        email: credentials.email,
        name: credentials.name,
        accountType: credentials.accountType,
        created_at: new Date().toISOString(),
        isProfileComplete: false,
        // Include identities to help components detect existing users
        identities: data.user?.identities,
      },
      emailVerificationSent: !data.user?.email_confirmed_at,
    };
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });
    if (error) throw error;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    // Login with password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("No user returned from login");

    // Store session tokens
    if (data.session) {
      if (data.session.access_token) {
        localStorage.setItem("authToken", data.session.access_token);
      }
      if (data.session.refresh_token) {
        localStorage.setItem("refreshToken", data.session.refresh_token);
      }
    }

    return this.mapSupabaseUserToUser(data.user);
  }

  async verifyOTP(credentials: OTPVerificationCredentials): Promise<User> {
    const { data, error } = await supabase.auth.verifyOtp({
      email: credentials.email,
      token: credentials.token,
      type: "email",
    });

    if (error) throw error;
    if (!data.user) throw new Error("No user returned from OTP verification");

    // If registration data is provided, create the profile
    if (credentials.registrationData) {
      await this.createUserProfile(data.user, credentials.registrationData);
    }

    // Store session tokens
    if (data.session) {
      if (data.session.access_token) {
        localStorage.setItem("authToken", data.session.access_token);
      }
      if (data.session.refresh_token) {
        localStorage.setItem("refreshToken", data.session.refresh_token);
      }
    }

    return this.mapSupabaseUserToUser(data.user);
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Clear all auth tokens
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
  }

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    return this.mapSupabaseUserToUser(data.user);
  }

  async getInvestorProfile(userId: string) {
    const { data, error } = await supabase
      .from("investors")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data;
  }

  async getStartupProfile(userId: string) {
    const { data, error } = await supabase
      .from("startups")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data;
  }

  async getAdminProfile(userId: string) {
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Admin profile not found");
    return data;
  }

  private async createUserProfile(
    user: SupabaseUser,
    registrationData: RegistrationData
  ): Promise<void> {
    const accountType = registrationData.accountType;

    if (accountType === "investor") {
      const investorData: Partial<Investor> = {
        id: user.id,
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
        calendly_link: registrationData.calendlyLink,
        heard_about_us: registrationData.howDidYouHear,
        number_of_investments: registrationData.numberOfInvestments,
        average_ticket_size: registrationData.averageTicketSize || "",
        secured_lead_investor: registrationData.hasSecuredLeadInvestor,
        participated_as_advisor: registrationData.hasBeenStartupAdvisor,
        strong_candidate_reason: registrationData.whyStrongCandidate,
        verified: false,
        status: "pending",
      };

      const { error } = await supabase.from("investors").insert(investorData);

      if (error) throw error;
    } else if (accountType === "startup") {
      const startupData: Partial<Startup> = {
        id: user.id,
        email: user.email!,
        name: registrationData.name,
        founder_info: registrationData.name,
        created_at: new Date().toISOString(),
        phone: registrationData.phone,
        startup_name: registrationData.startupName,
        website: registrationData.website,
        industry: registrationData.industry || "",
        stage: registrationData.stage as "Idea" | "MVP" | "Scaling" | undefined,
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

      const { error } = await supabase.from("startups").insert(startupData);

      if (error) throw error;
    }
  }

  private async mapSupabaseUserToUser(
    supabaseUser: SupabaseUser
  ): Promise<User> {
    const accountType = supabaseUser.user_metadata?.account_type as AccountType;

    // Try to get the name from the profile table first
    let profileName = supabaseUser.user_metadata?.name || "";
    let finalAccountType = accountType || "investor";

    try {
      // First check if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("name")
        .eq("id", supabaseUser.id)
        .maybeSingle();

      if (!adminError && adminData) {
        // User is an admin
        finalAccountType = "admin";
        if (adminData.name && adminData.name.trim() !== "") {
          profileName = adminData.name;
        }
        supabaseUser.user_metadata.account_type = "admin";
      } else if (accountType === "investor") {
        // Check investor table if not admin
        const { data: investorData, error: investorError } = await supabase
          .from("investors")
          .select("name")
          .eq("id", supabaseUser.id)
          .maybeSingle();

        // Use profile name if it exists and is not empty
        if (
          !investorError &&
          investorData?.name &&
          investorData.name.trim() !== ""
        ) {
          profileName = investorData.name;
        }
      } else if (accountType === "startup") {
        // Check startup table if not admin or investor
        const { data: startupData, error: startupError } = await supabase
          .from("startups")
          .select("name")
          .eq("id", supabaseUser.id)
          .maybeSingle();

        // Use profile name if it exists and is not empty
        if (
          !startupError &&
          startupData?.name &&
          startupData.name.trim() !== ""
        ) {
          profileName = startupData.name;
        }
      }
    } catch (error) {
      // If there's an error fetching profile data, just use the auth metadata name
      console.log("Could not fetch profile name, using auth metadata name");
    }

    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: profileName,
      accountType: finalAccountType,
      created_at: supabaseUser.created_at,
      isProfileComplete: supabaseUser.user_metadata?.isProfileComplete || false,
    };
  }
}

// Export singleton instance
export const simpleAuthService = new SimpleAuthService();

// Export helper hook for easy use in components
export const useSimpleAuth = () => {
  return {
    signUp: simpleAuthService.signUp.bind(simpleAuthService),
    verifyOTP: simpleAuthService.verifyOTP.bind(simpleAuthService),
    resendVerificationEmail:
      simpleAuthService.resendVerificationEmail.bind(simpleAuthService),
    login: simpleAuthService.login.bind(simpleAuthService),
    logout: simpleAuthService.logout.bind(simpleAuthService),
    getCurrentUser: simpleAuthService.getCurrentUser.bind(simpleAuthService),
    getInvestorProfile:
      simpleAuthService.getInvestorProfile.bind(simpleAuthService),
    getStartupProfile:
      simpleAuthService.getStartupProfile.bind(simpleAuthService),
    getAdminProfile: simpleAuthService.getAdminProfile.bind(simpleAuthService),
  };
};
