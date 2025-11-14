import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentSidebar } from "@/components/StudentSidebar";
import { StudentMobileSidebar } from "@/components/StudentMobileSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, Download, Trash2, Bell, Menu, Moon, Edit2, Bold, Italic, Underline, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function StudentMaterials() {
  const [userName, setUserName] = useState("");
  const [materials, setMaterials] = useState<any[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { isDark, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkStudentAccess();
    fetchUserData();
    loadMaterials();
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
      .select("full_name")
      .eq("id", user.id)
      .single();

    setUserName(data?.full_name || "Student");
  };

  const loadMaterials = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("student_materials")
      .select("*")
      .eq("student_id", user.id)
      .order("downloaded_at", { ascending: false });

    if (data) {
      setMaterials(data);
      setFilteredMaterials(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const filtered = materials.filter(material =>
      material.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMaterials(filtered);
  }, [searchTerm, materials]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("student_materials")
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
        description: "Material deleted",
      });
      loadMaterials();
    }
  };

  const openMaterial = (material: any) => {
    setSelectedMaterial(material);
    setEditedContent(material.content || "");
  };

  const handleDownload = (material: any) => {
    window.open(material.file_url, '_blank');
  };

  const saveMaterialContent = async () => {
    if (!selectedMaterial) return;

    const { error } = await supabase
      .from("student_materials")
      .update({ content: editedContent })
      .eq("id", selectedMaterial.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Changes saved",
      });
      setIsEditing(false);
      loadMaterials();
    }
  };

  const applyTextFormat = (format: string) => {
    document.execCommand(format, false);
  };

  return (
    <div className={`min-h-screen flex w-full ${isDark ? 'dark bg-gray-900' : 'bg-[#FAFBFC]'}`}>
      <StudentSidebar />
      
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
              <StudentMobileSidebar onClose={() => {}} />
            </SheetContent>
          </Sheet>

          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-foreground">My Materials</h1>
            <p className="text-xs text-muted-foreground">View and edit your downloaded materials</p>
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
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading materials...</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No materials downloaded yet</p>
              <p className="text-sm text-muted-foreground mt-2">Visit institutions to download study materials</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-1">{material.file_name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(material.downloaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      onClick={() => openMaterial(material)} 
                      variant="default" 
                      size="sm" 
                      className="w-full"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      View & Edit
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleDownload(material)}
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
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

      {/* Material Viewer Dialog */}
      <Dialog open={!!selectedMaterial} onOpenChange={() => setSelectedMaterial(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedMaterial?.file_name}</DialogTitle>
          </DialogHeader>
          
          {/* Editor Toolbar */}
          {isEditing && (
            <div className="flex gap-2 p-3 border rounded-lg bg-muted/30">
              <Button size="sm" variant="outline" onClick={() => applyTextFormat('bold')}>
                <Bold className="h-4 w-4 mr-1" />
                Bold
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyTextFormat('italic')}>
                <Italic className="h-4 w-4 mr-1" />
                Italic
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyTextFormat('underline')}>
                <Underline className="h-4 w-4 mr-1" />
                Underline
              </Button>
              <Button size="sm" variant="outline" onClick={() => document.execCommand('insertUnorderedList')}>
                List
              </Button>
            </div>
          )}

          {/* Content Area - Word-like viewer */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            <div className="bg-white dark:bg-gray-900 shadow-lg max-w-[800px] mx-auto my-4 min-h-[600px]">
              {isEditing ? (
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="p-12 min-h-[600px] outline-none prose prose-lg max-w-none"
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '16px',
                    lineHeight: '1.8'
                  }}
                  onInput={(e) => setEditedContent(e.currentTarget.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: editedContent }}
                />
              ) : (
                <div 
                  className="p-12 prose prose-lg max-w-none"
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '16px',
                    lineHeight: '1.8'
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedMaterial?.content || '<p style="text-align: center; color: #888; margin-top: 200px;">No content available. Click "Edit Content" to add notes.</p>' }}
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end border-t pt-4">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={saveMaterialContent}>Save Changes</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Content</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}