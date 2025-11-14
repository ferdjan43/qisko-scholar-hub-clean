import { useState, useEffect } from "react";
import { Check, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StudentSidebar } from "@/components/StudentSidebar";
import { StudentMobileSidebar } from "@/components/StudentMobileSidebar";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function StudentSubscription() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [coinBalance, setCoinBalance] = useState(0);

  useEffect(() => {
    loadPackages();
    loadCoinBalance();
  }, []);

  const loadPackages = async () => {
    const { data } = await supabase
      .from("subscription_packages")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });
    
    if (data) setPackages(data);
  };

  const loadCoinBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_coins")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (data) setCoinBalance(data.balance);
  };

  const handlePurchase = async (pkg: any) => {
    setSelectedPackage(pkg);
    setShowPaymentDialog(true);
  };

  const confirmPurchase = async () => {
    if (!selectedPackage) return;
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create transaction
    const { error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "subscription",
        amount: selectedPackage.coins,
        description: `Purchased ${selectedPackage.name}`,
        metadata: { package_id: selectedPackage.id, price: selectedPackage.price }
      });

    if (txError) {
      toast({
        title: "Error",
        description: "Failed to process purchase",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Update coin balance
    const { data: currentCoins } = await supabase
      .from("user_coins")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    const newBalance = (currentCoins?.balance || 0) + selectedPackage.coins;

    if (currentCoins) {
      await supabase
        .from("user_coins")
        .update({ balance: newBalance })
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("user_coins")
        .insert({ user_id: user.id, balance: newBalance });
    }

    toast({
      title: "Success!",
      description: `You've received ${selectedPackage.coins} coins!`,
    });

    setShowPaymentDialog(false);
    setLoading(false);
    loadCoinBalance();
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
            <h1 className="text-xl font-bold text-foreground">Subscription</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Subscription Packages</h2>
            <p className="text-sm md:text-base text-muted-foreground">Purchase coins to download study materials</p>
          </div>

          {/* Coin Balance */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Coins className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Your Balance</p>
                    <p className="text-2xl font-bold">{coinBalance} coins</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Packages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <Card 
                key={pkg.id} 
                className={`relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer overflow-hidden group ${
                  index === 1 ? 'border-2 border-primary scale-105' : ''
                }`}
                style={{
                  background: index === 1 ? 'linear-gradient(135deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--primary) / 0.1) 100%)' : ''
                }}
              >
                {index === 1 && (
                  <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative z-10">
                  <CardDescription className="text-muted-foreground text-sm uppercase tracking-wide">{pkg.name}</CardDescription>
                  <CardTitle className="text-4xl font-bold">
                    ₱{pkg.price}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-lg">{pkg.coins} coins</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4" />
                      <span className="text-sm">Download study materials</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4" />
                      <span className="text-sm">Access premium content</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handlePurchase(pkg)} 
                    className={`w-full ${index === 1 ? 'bg-primary hover:bg-primary/90' : ''}`}
                    size="lg"
                  >
                    Purchase Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Demo Payment</DialogTitle>
              <DialogDescription>
                In a real scenario, you would pay ₱{selectedPackage?.price} via payment gateway.
                For now, click confirm to receive your coins.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Package</p>
                <p className="font-semibold">{selectedPackage?.name}</p>
                <p className="text-sm text-muted-foreground mt-2">You will receive</p>
                <p className="text-2xl font-bold text-primary">{selectedPackage?.coins} coins</p>
              </div>
              <Button onClick={confirmPurchase} disabled={loading} className="w-full">
                {loading ? "Processing..." : "Confirm Purchase (Demo)"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}