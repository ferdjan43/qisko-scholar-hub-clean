import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentSidebar } from "@/components/StudentSidebar";
import { StudentMobileSidebar } from "@/components/StudentMobileSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Moon, User, GraduationCap, Award, MapPin, BookOpen, Target } from "lucide-react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useToast } from "@/hooks/use-toast";

export default function StudentProfile() {
  const [userName, setUserName] = useState("");
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const { toast } = useToast();

  useEffect(() => {
    checkStudentAccess();
    fetchProfile();
  }, []);

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

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("student_id", user.id)
      .single();

    setUserName(profile?.full_name || "Student");
    setProfileData(studentProfile);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <StudentSidebar />
      
      <div className="flex-1 flex flex-col md:ml-80">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <StudentMobileSidebar onClose={() => {}} />
                </SheetContent>
              </Sheet>
              
              <h1 className="text-xl md:text-2xl font-bold text-foreground">My Profile</h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
              >
                <Moon className={`h-5 w-5 ${isDark ? "fill-current" : ""}`} />
              </Button>

              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium">{userName}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Profile Header Card */}
            <Card className="border-border/40">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <Avatar className="h-24 w-24 bg-gradient-to-br from-primary to-primary/60">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-3xl font-bold">
                      {userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-foreground mb-2">{userName}</h2>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {profileData?.academic_level && (
                        <Badge variant="secondary">{profileData.academic_level}</Badge>
                      )}
                      {profileData?.field_of_study && (
                        <Badge variant="secondary">{profileData.field_of_study}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Field of Study</p>
                    <p className="font-medium">{profileData?.field_of_study || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Academic Level</p>
                    <p className="font-medium">{profileData?.academic_level || "Not specified"}</p>
                  </div>
                  {profileData?.gpa && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Average Grade</p>
                      <p className="font-medium">{profileData.gpa}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Interests & Skills */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Interests & Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData?.interests && profileData.interests.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {profileData.interests.map((interest: string) => (
                        <Badge key={interest} variant="outline">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profileData?.skills && profileData.skills.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill: string) => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profileData?.extracurricular && profileData.extracurricular.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Extracurricular Activities</p>
                    <div className="flex flex-wrap gap-2">
                      {profileData.extracurricular.map((activity: string) => (
                        <Badge key={activity} variant="outline">{activity}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scholarship Preferences */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Scholarship Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData?.preferred_scholarship_types && profileData.preferred_scholarship_types.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Preferred Types</p>
                    <div className="flex flex-wrap gap-2">
                      {profileData.preferred_scholarship_types.map((type: string) => (
                        <Badge key={type} variant="outline">{type}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profileData?.location_preference && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location Preference</p>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {profileData.location_preference}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
