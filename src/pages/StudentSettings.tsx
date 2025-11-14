import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StudentSidebar } from "@/components/StudentSidebar";
import { StudentMobileSidebar } from "@/components/StudentMobileSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Camera, Trophy, Star, Award, Target, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StudentSettings() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkStudentAccess();
    fetchUserData();
    fetchStudentProfile();
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

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    setUserName(data?.full_name || "");
    setUserEmail(data?.email || "");
  };

  const fetchStudentProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("student_id", user.id)
      .single();

    if (data) {
      setProfile(data);
      calculateProfileCompletion(data);
    }
    setLoading(false);
  };

  const calculateProfileCompletion = (profileData: any) => {
    const fields = [
      profileData.field_of_study,
      profileData.academic_level,
      profileData.gpa,
      profileData.interests?.length > 0,
      profileData.preferred_scholarship_types?.length > 0,
      profileData.location_preference,
      profileData.skills,
      profileData.achievements,
      profileData.extracurricular,
    ];
    const completed = fields.filter(Boolean).length;
    setProfileCompletion(Math.round((completed / fields.length) * 100));
  };

  const updateProfile = async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("student_profiles")
      .update(updates)
      .eq("student_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Profile updated successfully",
      });
      fetchStudentProfile();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const achievementsList = [
    { icon: <Trophy className="h-8 w-8" />, title: "Profile Complete", desc: "100% profile filled", unlocked: profileCompletion === 100 },
    { icon: <Star className="h-8 w-8" />, title: "First Application", desc: "Submit first scholarship", unlocked: false },
    { icon: <Award className="h-8 w-8" />, title: "Quiz Master", desc: "Complete 5 quizzes", unlocked: false },
    { icon: <Target className="h-8 w-8" />, title: "Early Bird", desc: "Apply before deadline", unlocked: false },
    { icon: <Zap className="h-8 w-8" />, title: "Quick Learner", desc: "Download 10 materials", unlocked: false },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background">
      <StudentSidebar />
      
      <div className="flex-1 flex flex-col md:ml-80">
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 md:px-8">
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

          <h1 className="text-xl font-semibold">Profile & Settings</h1>
          
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-white">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {/* Profile Completion Card */}
          <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Profile Completion</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Complete your profile to unlock smart matching
                  </CardDescription>
                </div>
                <div className="text-5xl font-bold text-primary">{profileCompletion}%</div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={profileCompletion} className="h-3" />
            </CardContent>
          </Card>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Photo</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-primary text-white text-3xl">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Field of Study</Label>
                      <Input
                        value={profile?.field_of_study || ""}
                        onChange={(e) => updateProfile({ field_of_study: e.target.value })}
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    <div>
                      <Label>Academic Level</Label>
                      <Input
                        value={profile?.academic_level || ""}
                        onChange={(e) => updateProfile({ academic_level: e.target.value })}
                        placeholder="e.g., Undergraduate"
                      />
                    </div>
                    <div>
                      <Label>GPA</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={profile?.gpa || ""}
                        onChange={(e) => updateProfile({ gpa: parseFloat(e.target.value) })}
                        placeholder="e.g., 3.75"
                      />
                    </div>
                    <div>
                      <Label>Location Preference</Label>
                      <Input
                        value={profile?.location_preference || ""}
                        onChange={(e) => updateProfile({ location_preference: e.target.value })}
                        placeholder="e.g., Metro Manila"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About You</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Skills & Talents</Label>
                    <Input
                      value={profile?.skills || ""}
                      onChange={(e) => updateProfile({ skills: e.target.value })}
                      placeholder="Programming, Leadership, etc."
                    />
                  </div>
                  <div>
                    <Label>Achievements</Label>
                    <Input
                      value={profile?.achievements || ""}
                      onChange={(e) => updateProfile({ achievements: e.target.value })}
                      placeholder="Awards, recognitions, etc."
                    />
                  </div>
                  <div>
                    <Label>Extracurricular Activities</Label>
                    <Input
                      value={profile?.extracurricular || ""}
                      onChange={(e) => updateProfile({ extracurricular: e.target.value })}
                      placeholder="Clubs, volunteer work, etc."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle>Your Achievements</CardTitle>
                  <CardDescription>Unlock badges as you use QuiSKO</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievementsList.map((achievement, idx) => (
                      <Card key={idx} className={achievement.unlocked ? "border-primary shadow-lg" : "opacity-50"}>
                        <CardContent className="p-6 text-center">
                          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                            achievement.unlocked ? "bg-primary text-white" : "bg-muted"
                          }`}>
                            {achievement.icon}
                          </div>
                          <h3 className="font-semibold mb-1">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.desc}</p>
                          {achievement.unlocked && (
                            <Badge className="mt-3">Unlocked!</Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={userName} disabled />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={userEmail} disabled />
                  </div>
                  <Button variant="outline">Change Password</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
