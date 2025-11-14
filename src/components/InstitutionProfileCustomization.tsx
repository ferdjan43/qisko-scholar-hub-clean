import { useState, useEffect } from "react";
import { Camera, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import ScholarshipApplicationBuilder from "./ScholarshipApplicationBuilder";

export default function InstitutionProfileCustomization() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [institutionId, setInstitutionId] = useState<string | null>(null);

  // Profile state
  const [profileData, setProfileData] = useState({
    institution_name: "",
    description: "",
    mission: "",
    vision: "",
    website_url: "",
    contact_number: "",
    address: "",
    location: "",
    cover_photo_url: "",
    profile_photo_url: "",
  });

  // Scholarships state
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [isScholarshipDialogOpen, setIsScholarshipDialogOpen] = useState(false);
  const [newScholarship, setNewScholarship] = useState({
    title: "",
    description: "",
    status: "draft",
  });

  // Study materials state
  const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    subject: "",
    file_type: "PDF",
    file_url: "",
  });
  const [uploadingFile, setUploadingFile] = useState(false);

  // Quizzes state
  const [quizzes, setQuizzes] = useState<any[]>([]);
  
  // Application builder
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string | null>(null);
  const [isAppBuilderOpen, setIsAppBuilderOpen] = useState(false);

  useEffect(() => {
    loadInstitutionProfile();
  }, []);

  const loadInstitutionProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("institution_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      setInstitutionId(profile.id);
      setProfileData({
        institution_name: profile.institution_name || "",
        description: profile.description || "",
        mission: profile.mission || "",
        vision: profile.vision || "",
        website_url: profile.website_url || "",
        contact_number: profile.contact_number || "",
        address: profile.address || "",
        location: profile.location || "",
        cover_photo_url: profile.cover_photo_url || "",
        profile_photo_url: profile.profile_photo_url || "",
      });
      loadScholarships(profile.id);
      loadStudyMaterials(profile.id);
      loadQuizzes(profile.id);
    }
  };

  const loadScholarships = async (instId: string) => {
    const { data } = await supabase
      .from("scholarships")
      .select("*")
      .eq("institution_id", instId)
      .order("created_at", { ascending: false });
    
    if (data) setScholarships(data);
  };

  const loadStudyMaterials = async (instId: string) => {
    const { data } = await supabase
      .from("study_materials")
      .select("*")
      .eq("institution_id", instId)
      .order("created_at", { ascending: false });
    
    if (data) setStudyMaterials(data);
  };

  const loadQuizzes = async (instId: string) => {
    const { data } = await supabase
      .from("quizzes")
      .select("*")
      .eq("institution_id", instId)
      .order("created_at", { ascending: false });
    
    if (data) setQuizzes(data);
  };

  const saveProfile = async () => {
    if (!institutionId) return;
    setLoading(true);

    const { error } = await supabase
      .from("institution_profiles")
      .update(profileData)
      .eq("id", institutionId);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    }
  };

  const addScholarship = async () => {
    if (!institutionId || !newScholarship.title) return;

    const { error } = await supabase
      .from("scholarships")
      .insert({
        institution_id: institutionId,
        ...newScholarship,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create scholarship",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Scholarship created successfully",
      });
      setIsScholarshipDialogOpen(false);
      setNewScholarship({ title: "", description: "", status: "draft" });
      loadScholarships(institutionId);
    }
  };

  const deleteScholarship = async (id: string) => {
    const { error } = await supabase
      .from("scholarships")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete scholarship",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Scholarship deleted successfully",
      });
      if (institutionId) loadScholarships(institutionId);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!institutionId || !file) return;

    setUploadingFile(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${institutionId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('institution-media')
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      setUploadingFile(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('institution-media')
      .getPublicUrl(fileName);

    setNewMaterial({ ...newMaterial, file_url: publicUrl });
    toast({
      title: "Success",
      description: "File uploaded successfully",
    });
    setUploadingFile(false);
  };

  const handleStudyMaterialFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const addStudyMaterial = async () => {
    if (!institutionId || !newMaterial.title || !newMaterial.subject) return;

    const { error } = await supabase
      .from("study_materials")
      .insert({
        institution_id: institutionId,
        ...newMaterial,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add study material",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Study material added successfully",
      });
      setIsMaterialDialogOpen(false);
      setNewMaterial({ title: "", subject: "", file_type: "PDF", file_url: "" });
      loadStudyMaterials(institutionId);
    }
  };

  const deleteMaterial = async (id: string) => {
    const { error } = await supabase
      .from("study_materials")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Material deleted successfully",
      });
      if (institutionId) loadStudyMaterials(institutionId);
    }
  };

  const openAppBuilder = (scholarshipId: string) => {
    setSelectedScholarshipId(scholarshipId);
    setIsAppBuilderOpen(true);
  };

  return (
    <div className="space-y-6 px-4 md:px-0 pb-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Customize Profile</h2>
        <p className="text-sm md:text-base text-muted-foreground">Manage your institution's public profile</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto flex-nowrap">
          <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap text-xs md:text-sm px-3 md:px-4 py-3">
            Profile Info
          </TabsTrigger>
          <TabsTrigger value="scholarships" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap text-xs md:text-sm px-3 md:px-4 py-3">
            Scholarships
          </TabsTrigger>
          <TabsTrigger value="materials" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap text-xs md:text-sm px-3 md:px-4 py-3">
            Study Materials
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap text-xs md:text-sm px-3 md:px-4 py-3">
            Quizzes
          </TabsTrigger>
        </TabsList>

        {/* Profile Info Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Cover & Profile Photos</CardTitle>
              <CardDescription>Upload and manage your institution's visual identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cover Photo</Label>
                <div className="relative h-40 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mt-2 overflow-hidden">
                  {profileData.cover_photo_url && (
                    <img src={profileData.cover_photo_url} alt="Cover" className="w-full h-full object-contain bg-gradient-to-r from-primary/20 to-primary/10" />
                  )}
                  <label className="cursor-pointer absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !institutionId) return;
                        
                        const fileExt = file.name.split('.').pop();
                        const filePath = `${institutionId}/cover.${fileExt}`;
                        
                        const { error: uploadError } = await supabase.storage
                          .from('institution-media')
                          .upload(filePath, file, { upsert: true });
                        
                        if (uploadError) {
                          toast({ title: "Error", description: "Failed to upload cover photo", variant: "destructive" });
                          return;
                        }
                        
                        const { data: { publicUrl } } = supabase.storage
                          .from('institution-media')
                          .getPublicUrl(filePath);
                        
                        await supabase
                          .from('institution_profiles')
                          .update({ cover_photo_url: publicUrl })
                          .eq('id', institutionId);
                        
                        setProfileData({ ...profileData, cover_photo_url: publicUrl });
                        toast({ title: "Success", description: "Cover photo updated" });
                      }}
                    />
                    <Button variant="secondary" size="sm" className="gap-2 pointer-events-none">
                      <Camera className="h-4 w-4" />
                      Upload Cover Photo
                    </Button>
                  </label>
                </div>
              </div>
              <div>
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                    {profileData.profile_photo_url ? (
                      <img src={profileData.profile_photo_url} alt="Profile" className="w-full h-full object-contain" />
                    ) : (
                      profileData.institution_name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !institutionId) return;
                        
                        const fileExt = file.name.split('.').pop();
                        const filePath = `${institutionId}/profile.${fileExt}`;
                        
                        const { error: uploadError } = await supabase.storage
                          .from('institution-media')
                          .upload(filePath, file, { upsert: true });
                        
                        if (uploadError) {
                          toast({ title: "Error", description: "Failed to upload profile photo", variant: "destructive" });
                          return;
                        }
                        
                        const { data: { publicUrl } } = supabase.storage
                          .from('institution-media')
                          .getPublicUrl(filePath);
                        
                        await supabase
                          .from('institution_profiles')
                          .update({ profile_photo_url: publicUrl })
                          .eq('id', institutionId);
                        
                        setProfileData({ ...profileData, profile_photo_url: publicUrl });
                        toast({ title: "Success", description: "Profile photo updated" });
                      }}
                    />
                    <Button variant="outline" size="sm" className="gap-2 pointer-events-none">
                      <Camera className="h-4 w-4" />
                      Change Photo
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Institution Name</Label>
                <Input
                  id="name"
                  value={profileData.institution_name}
                  onChange={(e) => setProfileData({ ...profileData, institution_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={profileData.description}
                  onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profileData.website_url}
                    onChange={(e) => setProfileData({ ...profileData, website_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input
                    id="contact"
                    value={profileData.contact_number}
                    onChange={(e) => setProfileData({ ...profileData, contact_number: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mission & Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mission">Mission Statement</Label>
                <Textarea
                  id="mission"
                  value={profileData.mission}
                  onChange={(e) => setProfileData({ ...profileData, mission: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="vision">Vision Statement</Label>
                <Textarea
                  id="vision"
                  value={profileData.vision}
                  onChange={(e) => setProfileData({ ...profileData, vision: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={saveProfile} disabled={loading} className="w-full md:w-auto">
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </TabsContent>

        {/* Scholarships Tab */}
        <TabsContent value="scholarships" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Manage scholarship posts and applications</p>
            <Dialog open={isScholarshipDialogOpen} onOpenChange={setIsScholarshipDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Scholarship
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Scholarship</DialogTitle>
                  <DialogDescription>Add a new scholarship opportunity</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="scholarship-title">Title</Label>
                    <Input
                      id="scholarship-title"
                      value={newScholarship.title}
                      onChange={(e) => setNewScholarship({ ...newScholarship, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scholarship-description">Description</Label>
                    <Textarea
                      id="scholarship-description"
                      value={newScholarship.description}
                      onChange={(e) => setNewScholarship({ ...newScholarship, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scholarship-status">Status</Label>
                    <Select value={newScholarship.status} onValueChange={(value) => setNewScholarship({ ...newScholarship, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addScholarship} className="w-full">Create Scholarship</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {scholarships.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No scholarships yet. Create your first one!</p>
                </CardContent>
              </Card>
            ) : (
              scholarships.map((scholarship) => (
                <Card key={scholarship.id}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-base md:text-lg">{scholarship.title}</CardTitle>
                        <CardDescription>{scholarship.status}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openAppBuilder(scholarship.id)}>
                          <Edit2 className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">Application</span>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteScholarship(scholarship.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm md:text-base text-muted-foreground">{scholarship.description}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Study Materials Tab */}
        <TabsContent value="materials" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Upload and manage study materials for students</p>
            <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Material
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Study Material</DialogTitle>
                  <DialogDescription>Upload a new study material or reviewer</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="material-title">Title</Label>
                    <Input
                      id="material-title"
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="material-subject">Subject</Label>
                    <Input
                      id="material-subject"
                      value={newMaterial.subject}
                      onChange={(e) => setNewMaterial({ ...newMaterial, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="material-type">File Type</Label>
                    <Select value={newMaterial.file_type} onValueChange={(value) => setNewMaterial({ ...newMaterial, file_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="DOCX">DOCX</SelectItem>
                        <SelectItem value="PPT">PPT</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="material-file">Upload File</Label>
                    <Input
                      id="material-file"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      disabled={uploadingFile}
                      className="cursor-pointer"
                    />
                    {uploadingFile && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                    {newMaterial.file_url && <p className="text-sm text-green-600 mt-1">File uploaded successfully!</p>}
                  </div>
                  <Button onClick={addStudyMaterial} className="w-full" disabled={uploadingFile}>
                    Add Material
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {studyMaterials.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No study materials yet. Add your first one!</p>
                </CardContent>
              </Card>
            ) : (
              studyMaterials.map((material) => (
                <Card key={material.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{material.title}</CardTitle>
                        <CardDescription>{material.subject}</CardDescription>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteMaterial(material.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary font-semibold text-xs">{material.file_type}</span>
                      </div>
                      <Button variant="outline" size="sm">Upload File</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Quizzes Tab */}
        <TabsContent value="quizzes" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Create and manage mock quizzes for students</p>
            <Button className="gap-2" onClick={() => navigate("/institution/content-hub")}>
              <Plus className="h-4 w-4" />
              Create Quiz
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {quizzes.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No quizzes yet. Create your first quiz!</p>
                  <Button onClick={() => navigate("/institution/content-hub")}>
                    Go to Content Hub
                  </Button>
                </CardContent>
              </Card>
            ) : (
              quizzes.map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                        <CardDescription>
                          {quiz.question_count} Questions • {quiz.difficulty} • {quiz.status}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{quiz.description}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Application Builder Dialog */}
      <Dialog open={isAppBuilderOpen} onOpenChange={setIsAppBuilderOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Scholarship Application Form</DialogTitle>
            <DialogDescription>
              Create a custom application form or add an external link
            </DialogDescription>
          </DialogHeader>
          {selectedScholarshipId && (
            <ScholarshipApplicationBuilder 
              scholarshipId={selectedScholarshipId}
              onSave={() => setIsAppBuilderOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
