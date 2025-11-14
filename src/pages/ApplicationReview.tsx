import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstitutionSidebar } from "@/components/InstitutionSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Menu, Moon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

interface Application {
  id: string;
  student_id: string;
  scholarship_id: string;
  application_data: any;
  status: string;
  submitted_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
  scholarships: {
    title: string;
  };
}

export default function ApplicationReview() {
  const [userName, setUserName] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { isDark, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  useEffect(() => {
    checkInstitutionAccess();
    fetchUserData();
    loadApplications();
  }, []);

  useEffect(() => {
    filterByStatus();
  }, [selectedStatus, applications]);

  const checkInstitutionAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isInstitution = roles?.some(r => r.role === "institution");
    if (!isInstitution) {
      navigate("/");
    }
  };

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("institution_profiles")
      .select("institution_name")
      .eq("user_id", user.id)
      .single();

    setUserName(data?.institution_name || "Institution");
  };

  const loadApplications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get institution ID
    const { data: profile } = await supabase
      .from("institution_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) return;

    // Get all applications for scholarships belonging to this institution
    const { data } = await supabase
      .from("student_applications")
      .select(`
        id,
        student_id,
        scholarship_id,
        application_data,
        status,
        submitted_at,
        profiles!student_applications_student_id_fkey (
          full_name,
          email
        ),
        scholarships!student_applications_scholarship_id_fkey (
          title
        )
      `)
      .eq("scholarships.institution_id", profile.id)
      .order("submitted_at", { ascending: false });

    if (data) {
      setApplications(data as any);
      setFilteredApplications(data as any);
    }
  };

  const filterByStatus = () => {
    if (selectedStatus === "all") {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === selectedStatus));
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    const { error } = await supabase
      .from("student_applications")
      .update({ status: newStatus })
      .eq("id", applicationId);

    if (!error) {
      loadApplications();
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'dark bg-gray-900' : 'bg-[#FAFBFC]'}`}>
      <InstitutionSidebar />
      
      <div className="flex-1 flex flex-col md:ml-80">
        {/* Header */}
        <header className={`h-16 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 border-b`}>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <InstitutionSidebar />
            </SheetContent>
          </Sheet>

          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-foreground">Application Review</h1>
            <p className="text-xs text-muted-foreground">Review and manage scholarship applications</p>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="hidden md:flex">
              <Moon className={`h-5 w-5 ${isDark ? 'text-yellow-400' : 'text-muted-foreground'}`} />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Avatar className="h-8 w-8 md:h-9 md:w-9">
              <AvatarFallback className="bg-primary text-white text-sm">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({applications.filter(a => a.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({applications.filter(a => a.status === "approved").length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({applications.filter(a => a.status === "rejected").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedStatus} className="space-y-4">
              {filteredApplications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">No applications found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredApplications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {application.profiles?.full_name || "Unknown Student"}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {application.profiles?.email}
                          </p>
                          <p className="text-sm text-primary mt-1">
                            {application.scholarships?.title}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              application.status === "approved"
                                ? "default"
                                : application.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {application.status.toUpperCase()}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(application.submitted_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Application Data */}
                      <div className="space-y-3">
                        {Object.entries(application.application_data || {}).map(([key, value]: [string, any]) => (
                          <div key={key} className="grid grid-cols-3 gap-4">
                            <p className="font-medium text-sm text-foreground col-span-1">{key}:</p>
                            <p className="text-sm text-muted-foreground col-span-2">
                              {typeof value === "object" ? JSON.stringify(value) : String(value)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      {application.status === "pending" && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            onClick={() => updateApplicationStatus(application.id, "approved")}
                            variant="default"
                            size="sm"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => updateApplicationStatus(application.id, "rejected")}
                            variant="destructive"
                            size="sm"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
