import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Bell, Mail, Building2, Users, Menu, CheckCircle, XCircle, Moon, Sun } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminMobileSidebar } from "@/components/AdminMobileSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface PendingInstitution {
  id: string;
  institution_name: string;
  approval_status: string;
  email?: string;
}

export default function AdminDashboard() {
  const [institutionCount, setInstitutionCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingInstitutions, setPendingInstitutions] = useState<PendingInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDark, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    checkAdminAccess();
    fetchData();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some(r => r.role === "admin");
    if (!isAdmin) {
      navigate("/");
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have admin privileges.",
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();
      setUserName(profile?.full_name || profile?.email || "Admin");
    }
    
    const { data: institutionsData, count: instCount } = await supabase
      .from("institution_profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (institutionsData) {
      setInstitutionCount(instCount || 0);
      setApprovedCount(institutionsData.filter(i => i.approval_status === 'approved').length);
      const pending = institutionsData.filter(i => i.approval_status === 'pending');
      setPendingCount(pending.length);
      
      // Fetch emails for pending institutions
      const pendingWithEmails = await Promise.all(
        pending.map(async (inst) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", inst.user_id)
            .single();
          return { ...inst, email: profile?.email };
        })
      );
      setPendingInstitutions(pendingWithEmails);
    }

    const { count: userCountData } = await supabase
      .from("profiles")
      .select("*", { count: "exact" });
    
    setUserCount(userCountData || 0);
    setLoading(false);
  };


  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className={`min-h-screen flex w-full ${isDark ? 'dark bg-gray-900' : 'bg-[#FAFBFC]'}`}>
      <AdminSidebar />
        
      <div className="flex-1 flex flex-col md:ml-80">
        <header className={`h-16 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} flex items-center justify-between px-4 md:px-8 border-b`}>
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <AdminMobileSidebar onClose={() => {}} />
              </SheetContent>
            </Sheet>

            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="hidden md:flex">
              <Moon className={`h-5 w-5 ${isDark ? 'text-yellow-400' : 'text-muted-foreground'}`} />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden md:flex relative"
                >
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Notifications</h4>
                    <Badge variant="secondary">{pendingCount}</Badge>
                  </div>
                  <ScrollArea className="h-[300px]">
                    {pendingInstitutions.length > 0 ? (
                      <div className="space-y-3">
                        {pendingInstitutions.map((inst) => (
                          <div 
                            key={inst.id} 
                            className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                            onClick={() => navigate("/admin/account-confirmation")}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{inst.institution_name}</p>
                                <p className="text-xs text-muted-foreground mt-1">{inst.email}</p>
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  {inst.approval_status || "pending"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No pending notifications</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-2 md:gap-3">
              <Avatar className="h-8 w-8 md:h-9 md:w-9">
                <AvatarFallback className="bg-primary text-white text-sm">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : ''}`}>{userName}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto max-w-full">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 md:p-8 mb-6 md:mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Hi, {userName}</h2>
                <p className="text-sm md:text-base text-muted-foreground">Ready to manage the platform?</p>
              </div>
              <div className="hidden md:block">
                <Building2 className="h-32 w-32 text-primary opacity-20" />
              </div>
            </div>

          {/* Overview Label */}
          <h3 className="text-sm text-muted-foreground mb-4">Overview</h3>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="bg-[#F59E0B] text-white border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8" />
                  <div>
                    <p className="text-3xl font-bold">{institutionCount}</p>
                    <p className="text-sm opacity-90">Institutions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#6366F1] text-white border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8" />
                  <div>
                    <p className="text-3xl font-bold">{approvedCount}</p>
                    <p className="text-sm opacity-90">Approved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#EC4899] text-white border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8" />
                  <div>
                    <p className="text-3xl font-bold">{userCount}</p>
                    <p className="text-sm opacity-90">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#A78BFA] text-white border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8" />
                  <div>
                    <p className="text-3xl font-bold">{pendingCount}</p>
                    <p className="text-sm opacity-90">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
