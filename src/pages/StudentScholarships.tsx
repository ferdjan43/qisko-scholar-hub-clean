import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StudentSidebar } from "@/components/StudentSidebar";
import { StudentMobileSidebar } from "@/components/StudentMobileSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MapPin, Globe, Phone, Bell, Menu, Moon, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Badge } from "@/components/ui/badge";
import InstitutionProfileManagement from "@/components/InstitutionProfileManagement";

interface Institution {
  id: string;
  institution_name: string;
  description: string;
  location: string;
  profile_photo_url: string;
  cover_photo_url: string;
}

export default function StudentScholarships() {
  const [userName, setUserName] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const { isDark, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const { institutionId } = useParams();

  useEffect(() => {
    checkStudentAccess();
    fetchUserData();
    loadInstitutions();
  }, []);

  useEffect(() => {
    if (institutionId) {
      loadSelectedInstitution(institutionId);
    }
  }, [institutionId]);

  useEffect(() => {
    filterInstitutions();
  }, [searchQuery, institutions]);

  const checkStudentAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isStudent = roles?.some(r => r.role === "student");
    if (!isStudent) {
      navigate("/");
    }
  };

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    setUserName(data?.full_name || "Student");
  };

  const loadInstitutions = async () => {
    const { data } = await supabase
      .from("institution_profiles")
      .select("id, institution_name, description, location, profile_photo_url, cover_photo_url")
      .eq("approval_status", "approved")
      .order("institution_name");

    if (data) {
      setInstitutions(data as Institution[]);
      setFilteredInstitutions(data as Institution[]);
    }
  };

  const loadSelectedInstitution = async (id: string) => {
    const { data } = await supabase
      .from("institution_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setSelectedInstitution(data as Institution);
    }
  };

  const filterInstitutions = () => {
    if (!searchQuery.trim()) {
      setFilteredInstitutions(institutions);
      return;
    }

    const filtered = institutions.filter(inst =>
      inst.institution_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredInstitutions(filtered);
  };

  const viewInstitution = (institution: Institution) => {
    navigate(`/student/scholarships/${institution.id}`);
  };

  const goBack = () => {
    navigate("/student/scholarships");
    setSelectedInstitution(null);
  };

  if (selectedInstitution && institutionId) {
    return (
      <div className={`min-h-screen flex ${isDark ? 'dark bg-gray-900' : 'bg-[#FAFBFC]'}`}>
        <StudentSidebar />
        
        <div className="flex-1 flex flex-col md:ml-80">
        {/* Header */}
        <header className={`h-16 ${isDark ? 'bg-gray-900' : 'bg-white'} flex items-center justify-between px-4 md:px-8 sticky top-0 z-10`}>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <StudentMobileSidebar onClose={() => {}} />
            </SheetContent>
          </Sheet>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={goBack} className="md:hidden">
                <X className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-foreground">{selectedInstitution.institution_name}</h1>
                <p className="text-xs text-muted-foreground">Institution Profile</p>
              </div>
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

          {/* Main Content - Institution Profile */}
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden overflow-y-auto w-full">
            <div className="max-w-full">
              <InstitutionProfileManagement institutionId={institutionId} isStudentView={true} />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDark ? 'dark bg-gray-900' : 'bg-[#FAFBFC]'}`}>
      <StudentSidebar />
      
      <div className="flex-1 flex flex-col md:ml-80">
        {/* Header */}
        <header className={`h-16 ${isDark ? 'bg-gray-900' : 'bg-white'} flex items-center justify-between px-4 md:px-8 sticky top-0 z-10`}>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <StudentMobileSidebar onClose={() => {}} />
            </SheetContent>
          </Sheet>

          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-foreground">Scholarships</h1>
            <p className="text-xs text-muted-foreground">Discover scholarship opportunities</p>
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
        <main className="flex-1 p-4 md:p-8 overflow-auto max-w-full">
          {/* Search & Filters */}
          <div className="mb-6 md:mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search institutions by name, location, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Institutions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredInstitutions.map((institution) => (
              <Card 
                key={institution.id} 
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group relative"
                onClick={() => viewInstitution(institution)}
              >
                {/* Cover Photo */}
                <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 overflow-hidden relative">
                  {institution.cover_photo_url && (
                    <img 
                      src={institution.cover_photo_url} 
                      alt="Cover" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                  )}
                  
                  {/* Profile Photo - Fixed position, stays in place on hover */}
                  <div className="absolute -bottom-12 left-4 md:left-6 z-20">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xl font-bold text-white border-4 border-background shadow-lg overflow-hidden">
                      {institution.profile_photo_url ? (
                        <img src={institution.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        institution.institution_name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 md:p-6 relative pt-16">
                  {/* Institution Info */}
                  <div>
                    <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                      {institution.institution_name}
                    </h3>
                    
                    {institution.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {institution.description}
                      </p>
                    )}

                    {institution.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{institution.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInstitutions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No institutions found matching your search.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
