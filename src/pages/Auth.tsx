import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowLeft } from "lucide-react";
import { z } from "zod";
import authHero from "@/assets/auth-hero.jpg";

const signupSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Full name is required").max(100),
  isInstitution: z.boolean(),
  institutionName: z.string().optional(),
  institutionType: z.string().optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  websiteUrl: z.string().optional(),
  registrationNumber: z.string().optional(),
  additionalInfo: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isInstitution, setIsInstitution] = useState(false);
  const [institutionName, setInstitutionName] = useState("");
  const [institutionType, setInstitutionType] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [loading, setLoading] = useState(false);
  
  // OTP states
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [signupData, setSignupData] = useState<any>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Only check session once on mount, don't auto-redirect on auth page
    // User chose to come to auth page, so don't interrupt them

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Only redirect on successful sign in, not on page load
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);
        
        const isInstitutionRole = roles?.some(r => r.role === "institution");
        
        if (isInstitutionRole) {
          // Check if institution is approved
          const { data: institution } = await supabase
            .from("institution_profiles")
            .select("approval_status")
            .eq("user_id", session.user.id)
            .single();
          
          // Only redirect if institution is approved
          if (institution?.approval_status === "approved") {
            redirectToDashboard(session.user.id);
          } else {
            // Institution pending approval, sign out and show message
            await supabase.auth.signOut();
            toast({
              variant: "destructive",
              title: "Account pending approval",
              description: "Your institution account is awaiting admin approval.",
            });
          }
        } else {
          redirectToDashboard(session.user.id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const redirectToDashboard = async (userId: string) => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (roles?.some(r => r.role === "admin")) {
      navigate("/admin");
    } else if (roles?.some(r => r.role === "institution")) {
      navigate("/institution");
    } else if (roles?.some(r => r.role === "student")) {
      navigate("/student");
    } else {
      navigate("/");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);
        
        // Check if user has institution role and verify approval status
        if (roles?.some(r => r.role === "institution")) {
          const { data: institutionProfile } = await supabase
            .from("institution_profiles")
            .select("approval_status")
            .eq("user_id", data.user.id)
            .single();
          
          if (institutionProfile?.approval_status === "pending") {
            await supabase.auth.signOut();
            toast({
              variant: "destructive",
              title: "Account Pending",
              description: "Wait for an admin to confirm your registration before you can log in.",
            });
            setLoading(false);
            return;
          }
          
          if (institutionProfile?.approval_status === "rejected") {
            await supabase.auth.signOut();
            toast({
              variant: "destructive",
              title: "Account Rejected",
              description: "Your institution registration has been rejected. Please contact support.",
            });
            setLoading(false);
            return;
          }
        }
        
        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validationResult = signupSchema.safeParse({
        email,
        password,
        confirmPassword,
        fullName,
        isInstitution,
        institutionName: isInstitution ? institutionName : undefined,
        institutionType: isInstitution ? institutionType : undefined,
        contactNumber: isInstitution ? contactNumber : undefined,
        address: isInstitution ? address : undefined,
        websiteUrl: isInstitution ? websiteUrl : undefined,
        registrationNumber: isInstitution ? registrationNumber : undefined,
        additionalInfo: isInstitution ? additionalInfo : undefined,
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message).join(", ");
        throw new Error(errors);
      }

      // Generate OTP
      const newOtp = generateOtp();
      setGeneratedOtp(newOtp);

      // Store signup data for later
      setSignupData({
        email,
        password,
        fullName,
        isInstitution,
        institutionName,
        institutionType,
        contactNumber,
        address,
        websiteUrl,
        registrationNumber,
        additionalInfo,
      });

      // Send OTP via Mailjet
      const { error: otpError } = await supabase.functions.invoke("send-otp", {
        body: {
          email,
          otp: newOtp,
          fullName,
        },
      });

      if (otpError) throw otpError;

      setShowOtpInput(true);
      toast({
        title: "Verification code sent!",
        description: "Please check your email for the OTP code.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (otp !== generatedOtp) {
        throw new Error("Invalid OTP code. Please try again.");
      }

      // Create account
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: signupData.fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        if (signupData.isInstitution) {
          // Add institution role only
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert([
              { user_id: data.user.id, role: "institution" }
            ]);

          if (roleError) throw roleError;

          // Create institution profile with pending status
          const { error: institutionError } = await supabase
            .from("institution_profiles")
            .insert([
              {
                user_id: data.user.id,
                institution_name: signupData.institutionName,
                institution_type: signupData.institutionType,
                contact_number: signupData.contactNumber,
                address: signupData.address,
                website_url: signupData.websiteUrl,
                registration_number: signupData.registrationNumber,
                additional_info: signupData.additionalInfo,
                approval_status: "pending"
              }
            ]);

          if (institutionError) throw institutionError;

          // Sign out after all database operations are complete
          await supabase.auth.signOut();

          toast({
            title: "Registration submitted!",
            description: "Your institution account is pending admin approval. You'll be able to login once approved.",
          });
        } else {
          // For student accounts, add student role
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert([
              { user_id: data.user.id, role: "student" }
            ]);

          if (roleError) throw roleError;
          
          // Sign out and redirect to login
          await supabase.auth.signOut();
          
          toast({
            title: "Account created successfully!",
            description: "You can now sign in with your credentials.",
          });
        }
        
        setIsLogin(true);
      }
      
      // Reset form and redirect to login
      setShowOtpInput(false);
      setOtp("");
      setGeneratedOtp("");
      setSignupData(null);
      setIsLogin(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 order-2 lg:order-1 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="animate-fade-in">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {showOtpInput ? "Verify Your Email" : isLogin ? "Welcome back!" : "Join QuiSKO"}
            </h1>
            <p className="text-muted-foreground">
              {showOtpInput 
                ? "Enter the 6-digit code sent to your email" 
                : isLogin 
                  ? "Simplify your scholarship search and boost your productivity with QuiSKO" 
                  : "Create an account to access scholarship opportunities"}
            </p>
          </div>

          {showOtpInput ? (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading || otp.length !== 6}>
                {loading ? "Verifying..." : "Verify & Create Account"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp("");
                  setGeneratedOtp("");
                }}
              >
                Back to Signup
              </Button>
            </form>
          ) : (
            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6 animate-fade-in" key={isLogin ? "login" : "register"}>
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Juan Dela Cruz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{isLogin ? "Username or Email" : "Email"}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Retype Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-4 bg-muted rounded-md">
                    <Checkbox
                      id="isInstitution"
                      checked={isInstitution}
                      onCheckedChange={(checked) => setIsInstitution(checked as boolean)}
                    />
                    <Label htmlFor="isInstitution" className="cursor-pointer">
                      I am registering as an Institution
                    </Label>
                  </div>

                  {isInstitution && (
                    <div className="space-y-4 p-4 bg-accent/10 rounded-md border border-accent">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Institution Information
                      </h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="institutionName">Institution Name *</Label>
                        <Input
                          id="institutionName"
                          type="text"
                          placeholder="University of the Philippines"
                          value={institutionName}
                          onChange={(e) => setInstitutionName(e.target.value)}
                          required={isInstitution}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="institutionType">Type of Institution</Label>
                        <Input
                          id="institutionType"
                          type="text"
                          placeholder="State University, Private College, etc."
                          value={institutionType}
                          onChange={(e) => setInstitutionType(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactNumber">Contact Number</Label>
                        <Input
                          id="contactNumber"
                          type="tel"
                          placeholder="+63 912 345 6789"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          type="text"
                          placeholder="Diliman, Quezon City"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="websiteUrl">Website URL</Label>
                        <Input
                          id="websiteUrl"
                          type="url"
                          placeholder="https://www.institution.edu.ph"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registrationNumber">Registration Number *</Label>
                        <Input
                          id="registrationNumber"
                          type="text"
                          placeholder="e.g., SEC Registration No."
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value)}
                          required={isInstitution}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additionalInfo">Additional Information</Label>
                        <Input
                          id="additionalInfo"
                          type="text"
                          placeholder="Any other relevant information"
                          value={additionalInfo}
                          onChange={(e) => setAdditionalInfo(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <button type="button" className="text-sm text-muted-foreground hover:text-primary">
                    Forgot Password?
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Please wait..." : isLogin ? "Login" : "Send Verification Code"}
              </Button>
            </form>
          )}

          {!showOtpInput && (
            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "Not a member? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-semibold hover:underline"
              >
                {isLogin ? "Register now" : "Login"}
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={authHero} 
            alt="Students studying together" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/50" />
        </div>
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="max-w-lg text-center space-y-6 animate-fade-in">
            <h2 className="text-4xl font-bold text-white">
              Make your scholarship search easier and organized with QuiSKO
            </h2>
            <p className="text-white/90 text-lg">
              Connect with opportunities, track applications, and achieve your educational dreams
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
