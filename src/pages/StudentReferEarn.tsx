import { useState, useEffect } from "react";
import { Copy, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StudentSidebar } from "@/components/StudentSidebar";
import { StudentMobileSidebar } from "@/components/StudentMobileSidebar";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function StudentReferEarn() {
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get or create referral code
    let { data: codeData } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", user.id)
      .single();

    if (!codeData) {
      const { data: newCode } = await supabase.rpc("generate_referral_code");
      if (newCode) {
        await supabase
          .from("referral_codes")
          .insert({ user_id: user.id, code: newCode });
        setReferralCode(newCode);
      }
    } else {
      setReferralCode(codeData.code);
    }

    // Get referrals
    const { data: referralData } = await supabase
      .from("referrals")
      .select("*, referred:profiles!referrals_referred_id_fkey(full_name)")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false });

    if (referralData) {
      setReferrals(referralData);
      setTotalCoins(referralData.reduce((sum, ref) => sum + ref.coins_awarded, 0));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const shareReferral = () => {
    const text = `Join Quisko and get 5 coins! Use my referral code: ${referralCode}`;
    if (navigator.share) {
      navigator.share({ title: "Join Quisko", text });
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <StudentSidebar />
      
      <main className="flex-1 md:ml-80 max-w-full overflow-x-hidden">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <StudentMobileSidebar onClose={() => {}} />
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold text-foreground">Refer & Earn</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Refer & Earn</h2>
            <p className="text-sm md:text-base text-muted-foreground">Invite friends and earn 5 coins per referral</p>
          </div>

          {/* Referral Code Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle>Your Referral Code</CardTitle>
              <CardDescription>Share this code with friends to earn rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={referralCode}
                  readOnly
                  className="text-lg font-mono text-center"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" className="flex-1 gap-2">
                  <Copy className="h-4 w-4" />
                  Copy Code
                </Button>
                <Button onClick={shareReferral} className="flex-1 gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-primary" />
                  <span className="text-3xl font-bold">{referrals.length}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Coins Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">{totalCoins}</span>
                  <span className="text-muted-foreground">coins</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referrals List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referrals</CardTitle>
              <CardDescription>People who joined using your code</CardDescription>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No referrals yet. Start sharing your code!</p>
              ) : (
                <div className="space-y-3">
                  {referrals.map((ref) => (
                    <div key={ref.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{ref.referred?.full_name || "User"}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(ref.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">+{ref.coins_awarded} coins</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}