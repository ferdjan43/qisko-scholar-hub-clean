import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Bell, Mail, Eye, Menu } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Moon, Sun } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InstitutionProfile {
  id: string;
  user_id: string;
  institution_name: string;
  institution_type: string;
  contact_number: string;
  address: string;
  website_url: string;
  registration_number: string;
  additional_info: string;
  approval_status: string;
  created_at: string;
  email?: string;
  full_name?: string;
}

export default function AccountConfirmation() {
  const [institutions, setInstitutions] = useState<InstitutionProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionProfile | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
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
    
    // Only fetch pending and rejected institutions for approval page
    const { data: institutionsData } = await supabase
      .from("institution_profiles")
      .select("*")
      .in("approval_status", ["pending", "rejected"])
      .order("created_at", { ascending: false });

    if (institutionsData) {
      const institutionsWithProfiles = await Promise.all(
        institutionsData.map(async (inst) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", inst.user_id)
            .single();
          return { ...inst, email: profile?.email, full_name: profile?.full_name };
        })
      );
      setInstitutions(institutionsWithProfiles);
      setPendingCount(institutionsWithProfiles.filter(i => i.approval_status === 'pending').length);
    }
    
    setLoading(false);
  };

  const handleApproval = async (institutionId: string, userId: string, approve: boolean) => {
    try {
      if (approve) {
        // Approve the institution
        const { error } = await supabase
          .from("institution_profiles")
          .update({
            approval_status: "approved",
            approved_at: new Date().toISOString(),
            approved_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .eq("id", institutionId);

        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
          return;
        }

        toast({
          title: "Institution Approved",
          description: "The institution has been approved and can now access the platform.",
        });
      } else {
        // Reject and delete the institution profile and user role
        const { error: deleteProfileError } = await supabase
          .from("institution_profiles")
          .delete()
          .eq("id", institutionId);

        if (deleteProfileError) {
          toast({
            variant: "destructive",
            title: "Error",
            description: deleteProfileError.message,
          });
          return;
        }

        // Delete the institution role from user_roles
        const { error: deleteRoleError } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "institution");

        if (deleteRoleError) {
          console.error("Error deleting role:", deleteRoleError);
        }

        toast({
          title: "Institution Rejected",
          description: "The institution application has been rejected and deleted.",
        });
      }

      // Refresh data to update UI
      await fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred",
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
        
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-card flex items-center justify-between px-4 md:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <AdminSidebar />
            </SheetContent>
          </Sheet>

          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-foreground">Account Confirmation</h1>
            <p className="text-xs text-muted-foreground">Review and approve institution registrations</p>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:flex relative">
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
                    {institutions.length > 0 ? (
                      <div className="space-y-3">
                        {institutions.map((inst) => (
                          <div key={inst.id} className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
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
                <p className="text-sm font-medium">{userName}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Institution Applications</CardTitle>
              <CardDescription>Review and approve institution registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                  <TableRow>
                    <TableHead>Institution Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {institutions.map((inst) => (
                    <TableRow key={inst.id}>
                      <TableCell className="font-medium">{inst.institution_name}</TableCell>
                      <TableCell>{inst.institution_type || "N/A"}</TableCell>
                      <TableCell>{inst.contact_number || "N/A"}</TableCell>
                      <TableCell>{inst.email}</TableCell>
                       <TableCell>
                        <Badge variant={
                          inst.approval_status === "approved" ? "default" :
                          inst.approval_status === "rejected" ? "destructive" : "secondary"
                        }>
                          {inst.approval_status || "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedInstitution(inst)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Institution Details</DialogTitle>
                                <DialogDescription>
                                  Review the complete information for this institution
                                </DialogDescription>
                              </DialogHeader>
                              {selectedInstitution && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Institution Name</p>
                                      <p className="text-sm">{selectedInstitution.institution_name}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                                      <p className="text-sm">{selectedInstitution.institution_type || "N/A"}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                                      <p className="text-sm">{selectedInstitution.full_name || "N/A"}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                                      <p className="text-sm">{selectedInstitution.email}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                                      <p className="text-sm">{selectedInstitution.contact_number || "N/A"}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
                                      <p className="text-sm">{selectedInstitution.registration_number || "N/A"}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                                      <p className="text-sm">{selectedInstitution.address || "N/A"}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-sm font-medium text-muted-foreground">Website</p>
                                      <p className="text-sm">{selectedInstitution.website_url || "N/A"}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-sm font-medium text-muted-foreground">Additional Information</p>
                                      <p className="text-sm">{selectedInstitution.additional_info || "N/A"}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {inst.approval_status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproval(inst.id, inst.user_id, true)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleApproval(inst.id, inst.user_id, false)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
