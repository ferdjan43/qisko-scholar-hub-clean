import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstitutionSidebar } from "@/components/InstitutionSidebar";
import { InstitutionMobileSidebar } from "@/components/InstitutionMobileSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Upload, FileText, Trash2, Bell, Menu, Moon, Eye, Edit2 } from "lucide-react";
import mammoth from "mammoth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function InstitutionLearningMaterials() {
  const [userName, setUserName] = useState("");
  const [materials, setMaterials] = useState<any[]>([]);
  const [institutionId, setInstitutionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialSubject, setMaterialSubject] = useState("");
  const [postToProfile, setPostToProfile] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [materialContent, setMaterialContent] = useState<string>("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { isDark, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkInstitutionAccess();
    fetchUserData();
    loadMaterials();
  }, []);

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
      .select("institution_name, id")
      .eq("user_id", user.id)
      .single();

    setUserName(data?.institution_name || "Institution");
    setInstitutionId(data?.id || "");
    setLoading(false);
  };

  const loadMaterials = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("institution_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) return;

    const { data } = await supabase
      .from("study_materials")
      .select("*")
      .eq("institution_id", profile.id)
      .order("created_at", { ascending: false });

    if (data) {
      setMaterials(data);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !materialTitle || !materialSubject || !institutionId) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields and select a file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload file to storage
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${institutionId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(fileName, uploadFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('study-materials')
        .getPublicUrl(fileName);

      // Save to database
      const { error } = await supabase
        .from("study_materials")
        .insert([{
          institution_id: institutionId,
          title: materialTitle,
          subject: materialSubject,
          file_url: publicUrl,
          file_type: fileExt,
          file_size: `${(uploadFile.size / 1024).toFixed(2)} KB`,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Material uploaded successfully",
      });

      setShowUploadDialog(false);
      setMaterialTitle("");
      setMaterialSubject("");
      setUploadFile(null);
      setPostToProfile(false);
      loadMaterials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("study_materials")
      .delete()
      .eq("id", id);

    if (!error) {
      toast({ title: "Material deleted" });
      loadMaterials();
    }
  };

  const viewMaterial = async (material: any) => {
    setSelectedMaterial(material);
    setIsViewDialogOpen(true);
    
    // Try to fetch and parse the file
    if (material.file_url && material.file_type === 'docx') {
      try {
        const response = await fetch(material.file_url);
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setMaterialContent(result.value);
      } catch (error) {
        setMaterialContent("<p>Unable to load document content. Please download the file to view it.</p>");
      }
    } else if (material.file_url) {
      setMaterialContent("<p>Preview not available for this file type. Please download to view.</p>");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className={`min-h-screen flex w-full ${isDark ? 'dark bg-gray-900' : 'bg-[#FAFBFC]'}`}>
      <InstitutionSidebar />
      
      <div className="flex-1 flex flex-col md:ml-80">
        {/* Header */}
        <header className={`h-16 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} flex items-center justify-between px-4 md:px-8 sticky top-0 z-10`}>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <InstitutionMobileSidebar onClose={() => {}} />
            </SheetContent>
          </Sheet>

          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-foreground">Learning Materials</h1>
            <p className="text-xs text-muted-foreground">Upload and manage study materials</p>
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">My Materials</h2>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Material
            </Button>
          </div>

          {materials.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No materials uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((material) => (
                <Card key={material.id} className="hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-1">{material.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Subject: {material.subject}
                        </p>
                      </div>
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => viewMaterial(material)}
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        View/Edit
                      </Button>
                      <Button 
                        onClick={() => handleDelete(material.id)}
                        variant="ghost" 
                        size="sm"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* View/Edit Material Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedMaterial?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto border rounded-lg p-6">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: materialContent || '<p>Loading...</p>' }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Learning Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Material Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Calculus"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics"
                value={materialSubject}
                onChange={(e) => setMaterialSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="file">File *</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="post-profile"
                checked={postToProfile}
                onCheckedChange={(checked) => setPostToProfile(checked as boolean)}
              />
              <Label htmlFor="post-profile" className="cursor-pointer">
                Post to my profile
              </Label>
            </div>
            <Button onClick={handleUpload} disabled={loading} className="w-full">
              {loading ? "Uploading..." : "Upload Material"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
