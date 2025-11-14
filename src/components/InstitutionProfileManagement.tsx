import { useState, useEffect } from "react";
import { Camera, Image as ImageIcon, Link as LinkIcon, Send, X, Heart, MessageCircle, Share2, MapPin, Globe, Phone, Mail } from "lucide-react";
import PostCard from "./PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Post {
  id: string;
  content: string;
  images: any;
  links: any;
  is_pinned: boolean;
  post_type: string;
  created_at: string;
  institution_id: string;
}

interface InstitutionProfile {
  id: string;
  institution_name: string;
  description: string;
  mission: string;
  vision: string;
  website_url: string;
  contact_number: string;
  address: string;
  location: string;
  cover_photo_url: string;
  profile_photo_url: string;
}

interface Scholarship {
  id: string;
  title: string;
  description: string;
  image_url: string;
  application_deadline: string;
  eligibility_criteria: string;
  benefits: string;
}

interface Props {
  institutionId?: string;
  isStudentView?: boolean;
}

export default function InstitutionProfileManagement({ institutionId: propInstitutionId, isStudentView = false }: Props = {}) {
  const { toast } = useToast();
  const [institutionId, setInstitutionId] = useState<string | null>(propInstitutionId || null);
  const [profile, setProfile] = useState<InstitutionProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [links, setLinks] = useState<{ url: string; title: string }[]>([]);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState({ url: "", title: "" });
  const [loading, setLoading] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [applicationFormOpen, setApplicationFormOpen] = useState(false);
  const [applicationFormData, setApplicationFormData] = useState<any>({});
  const [scholarshipApplicationForm, setScholarshipApplicationForm] = useState<any>(null);

  useEffect(() => {
    if (propInstitutionId) {
      // Student viewing institution profile
      loadInstitutionData(propInstitutionId);
    } else {
      // Institution viewing own profile
      loadInstitutionProfile();
    }
  }, [propInstitutionId]);

  const loadInstitutionData = async (instId: string) => {
    const { data: profileData } = await supabase
      .from("institution_profiles")
      .select("*")
      .eq("id", instId)
      .single();

    if (profileData) {
      setInstitutionId(profileData.id);
      setProfile(profileData as InstitutionProfile);
      loadPosts(profileData.id);
      loadScholarships(profileData.id);
      loadStudyMaterials(profileData.id);
      loadQuizzes(profileData.id);
    }
  };

  const loadInstitutionProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase
      .from("institution_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileData) {
      setInstitutionId(profileData.id);
      setProfile(profileData as InstitutionProfile);
      loadPosts(profileData.id);
      loadScholarships(profileData.id);
      loadStudyMaterials(profileData.id);
      loadQuizzes(profileData.id);
    }
  };

  const loadScholarships = async (instId: string) => {
    const { data } = await supabase
      .from("scholarships")
      .select("*")
      .eq("institution_id", instId)
      .eq("status", "published")
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
      .eq("status", "published")
      .order("created_at", { ascending: false });
    
    if (data) setQuizzes(data);
  };

  const loadPosts = async (instId: string) => {
    const { data } = await supabase
      .from("institution_posts")
      .select("*")
      .eq("institution_id", instId)
      .order("created_at", { ascending: false });
    
    if (data) setPosts(data as any);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const { error } = await supabase
      .from("institution_posts")
      .delete()
      .eq("id", postId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      if (institutionId) loadPosts(institutionId);
    }
  };

  const handleEditPost = (postId: string) => {
    toast({
      title: "Edit Feature",
      description: "Edit functionality coming soon!",
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages([...selectedImages, ...Array.from(e.target.files)]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const addLink = () => {
    if (newLink.url) {
      setLinks([...links, newLink]);
      setNewLink({ url: "", title: "" });
      setIsLinkDialogOpen(false);
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const createPost = async () => {
    if (!institutionId || (!newPost.trim() && selectedImages.length === 0)) {
      toast({
        title: "Empty post",
        description: "Please add some content or images",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload images to storage first
      const uploadedImageUrls: string[] = [];
      
      for (const imageFile of selectedImages) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${institutionId}/posts/${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('institution-media')
          .upload(fileName, imageFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('institution-media')
            .getPublicUrl(fileName);
          uploadedImageUrls.push(publicUrl);
        }
      }

      const { error } = await supabase
        .from("institution_posts")
        .insert({
          institution_id: institutionId,
          content: newPost,
          images: uploadedImageUrls,
          links: links,
          post_type: "general",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully",
      });

      // Reset form
      setNewPost("");
      setSelectedImages([]);
      setLinks([]);
      
      // Reload posts
      loadPosts(institutionId);
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

  return (
    <div className="space-y-6 pb-8">
      {/* Cover Photo */}
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg overflow-hidden">
        {profile?.cover_photo_url && (
          <img src={profile.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Profile Header */}
      <div className="px-4 md:px-6 -mt-16 md:-mt-20">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
          {/* Profile Photo */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl md:text-4xl font-bold text-white border-4 border-background shadow-lg overflow-hidden">
            {profile?.profile_photo_url ? (
              <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-contain" />
            ) : (
              profile?.institution_name.substring(0, 2).toUpperCase()
            )}
          </div>

          {/* Institution Info */}
          <div className="flex-1 bg-background/80 backdrop-blur-sm rounded-lg p-4 md:p-6 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{profile?.institution_name}</h1>
            {profile?.description && (
              <p className="text-sm md:text-base text-muted-foreground mb-3">{profile.description}</p>
            )}
            
            <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
              {profile?.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.website_url && (
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    Website
                  </a>
                </div>
              )}
              {profile?.contact_number && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{profile.contact_number}</span>
                </div>
              )}
            </div>

            {/* Mission & Vision */}
            {(profile?.mission || profile?.vision) && (
              <div className="mt-4 pt-4 border-t grid gap-3">
                {profile?.mission && (
                  <div>
                    <h3 className="text-xs font-semibold text-foreground mb-1">MISSION</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">{profile.mission}</p>
                  </div>
                )}
                {profile?.vision && (
                  <div>
                    <h3 className="text-xs font-semibold text-foreground mb-1">VISION</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">{profile.vision}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="info" className="px-4 md:px-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto flex-nowrap">
          <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap text-xs md:text-sm px-3 md:px-4 py-3">
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

        {/* Profile Info Content */}
        <TabsContent value="info" className="mt-6 space-y-6">
          {/* Scholarship Highlights */}
          {scholarships.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Our Scholarships</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scholarships.slice(0, 6).map((scholarship) => (
                  <Card key={scholarship.id} className="overflow-hidden hover:shadow-lg transition-shadow border-primary/20">
                    {scholarship.image_url && (
                      <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 overflow-hidden">
                        <img src={scholarship.image_url} alt={scholarship.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-foreground mb-1 line-clamp-1">{scholarship.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{scholarship.description}</p>
                      {scholarship.application_deadline && (
                        <Badge variant="secondary" className="text-xs">
                          Deadline: {new Date(scholarship.application_deadline).toLocaleDateString()}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Create Post Card - Only show for institution owners */}
          {!isStudentView && (
          <Card className="border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  {profile?.profile_photo_url ? (
                    <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-contain" />
                  ) : (
                    <AvatarFallback className="bg-primary text-white">
                      {profile?.institution_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Textarea
                  placeholder="Share scholarship opportunities, announcements, or updates..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

          {/* Image Previews */}
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {selectedImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(img)}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Links Preview */}
          {links.length > 0 && (
            <div className="space-y-2 mb-4">
              {links.map((link, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <LinkIcon className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{link.title || link.url}</p>
                    <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <button onClick={() => removeLink(index)} className="text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t">
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm hidden md:inline">Photo</span>
                </div>
              </label>
              
              <button
                onClick={() => setIsLinkDialogOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                <LinkIcon className="h-4 w-4 text-primary" />
                <span className="text-sm hidden md:inline">Link</span>
              </button>
            </div>

            <Button onClick={createPost} disabled={loading} className="gap-2">
              <Send className="h-4 w-4" />
              Post
            </Button>
          </div>
        </CardContent>
      </Card>
          )}

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                institutionName={profile?.institution_name || ""}
                institutionPhoto={profile?.profile_photo_url || null}
                canEdit={!isStudentView}
                onDelete={!isStudentView ? handleDeletePost : undefined}
                onEdit={!isStudentView ? handleEditPost : undefined}
              />
            ))}
          </div>
        </TabsContent>

        {/* Scholarships Content */}
        <TabsContent value="scholarships" className="mt-6">
          <ScrollArea className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scholarships.map((scholarship) => (
                <Card 
                  key={scholarship.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={async () => {
                    if (isStudentView) {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) return;
                      
                      // Check if already applied
                      const { data: existing } = await supabase
                        .from("student_applications")
                        .select("id")
                        .eq("student_id", user.id)
                        .eq("scholarship_id", scholarship.id)
                        .maybeSingle();
                      
                      if (existing) {
                        toast({
                          title: "Already Applied",
                          description: "You have already submitted an application for this scholarship",
                        });
                        return;
                      }
                      
                      setSelectedScholarship(scholarship);
                      // Load scholarship application form
                      const { data: appForm } = await supabase
                        .from("scholarship_applications")
                        .select("*")
                        .eq("scholarship_id", scholarship.id)
                        .single();
                      
                      setScholarshipApplicationForm(appForm);
                      setApplicationFormOpen(true);
                    }
                  }}
                >
                  {scholarship.image_url && (
                    <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 overflow-hidden">
                      <img src={scholarship.image_url} alt={scholarship.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">{scholarship.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2">{scholarship.description}</p>
                    {scholarship.application_deadline && (
                      <Badge variant="secondary" className="text-xs">
                        Deadline: {new Date(scholarship.application_deadline).toLocaleDateString()}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
              {scholarships.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No scholarships available yet
                </div>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </TabsContent>

        {/* Study Materials Content */}
        <TabsContent value="materials" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyMaterials.map((material) => (
              <Card key={material.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">{material.title}</h3>
                      <p className="text-sm text-muted-foreground">Subject: {material.subject}</p>
                      {material.file_type && (
                        <Badge variant="outline" className="mt-2 text-xs">{material.file_type}</Badge>
                      )}
                      {isStudentView && material.file_url && (
                        <div className="flex gap-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={async () => {
                              const { data: { user } } = await supabase.auth.getUser();
                              if (!user) return;
                              
                              const { data: coins } = await supabase
                                .from("user_coins")
                                .select("balance")
                                .eq("user_id", user.id)
                                .single();
                              
                              if (!coins || coins.balance < 1) {
                                toast({
                                  title: "Insufficient Coins",
                                  description: "You need at least 1 coin to download",
                                  variant: "destructive"
                                });
                                return;
                              }
                              
                              await supabase
                                .from("user_coins")
                                .update({ balance: coins.balance - 1 })
                                .eq("user_id", user.id);
                              
                              await supabase
                                .from("transactions")
                                .insert({
                                  user_id: user.id,
                                  type: "material_download",
                                  amount: -1,
                                  description: `Downloaded ${material.title}`
                                });
                              
                              window.open(material.file_url, '_blank');
                              toast({
                                title: "Download Started",
                                description: "1 coin deducted from your balance"
                              });
                            }}
                          >
                            Download (1 coin)
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={async () => {
                              const { data: { user } } = await supabase.auth.getUser();
                              if (!user) return;
                              
                              const { error } = await supabase
                                .from("student_materials")
                                .insert({
                                  student_id: user.id,
                                  file_name: material.title,
                                  file_url: material.file_url,
                                  file_type: material.file_type,
                                  content: ""
                                });
                              
                              if (!error) {
                                toast({
                                  title: "Added to Materials",
                                  description: "Material added to your library"
                                });
                              }
                            }}
                          >
                            Add to Materials
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {studyMaterials.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No study materials available yet
              </div>
            )}
          </div>
        </TabsContent>

        {/* Quizzes Content */}
        <TabsContent value="quizzes" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2">{quiz.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{quiz.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {quiz.subject && <Badge variant="secondary" className="text-xs">{quiz.subject}</Badge>}
                    {quiz.difficulty && <Badge variant="outline" className="text-xs">{quiz.difficulty}</Badge>}
                    {quiz.question_count && (
                      <span className="text-xs text-muted-foreground">{quiz.question_count} questions</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {quizzes.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No quizzes available yet
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>Add a link to your post</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="link-url">URL*</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="link-title">Title (optional)</Label>
              <Input
                id="link-title"
                placeholder="Link title"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
              />
            </div>
            <Button onClick={addLink} className="w-full">Add Link</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scholarship Application Dialog */}
      <Dialog open={applicationFormOpen} onOpenChange={setApplicationFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedScholarship?.title}</DialogTitle>
            <DialogDescription>Fill out the application form</DialogDescription>
          </DialogHeader>
          {selectedScholarship && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">{selectedScholarship.description}</p>
                {selectedScholarship.eligibility_criteria && (
                  <div className="mb-2">
                    <p className="text-sm font-medium">Eligibility:</p>
                    <p className="text-sm text-muted-foreground">{selectedScholarship.eligibility_criteria}</p>
                  </div>
                )}
                {selectedScholarship.benefits && (
                  <div>
                    <p className="text-sm font-medium">Benefits:</p>
                    <p className="text-sm text-muted-foreground">{selectedScholarship.benefits}</p>
                  </div>
                )}
              </div>
              
              {/* Dynamic Form Fields from Institution */}
              {scholarshipApplicationForm && scholarshipApplicationForm.form_type === "external_link" ? (
                <div className="p-6 bg-muted/30 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    This scholarship uses an external application form
                  </p>
                  <Button 
                    onClick={() => window.open(scholarshipApplicationForm.external_link, '_blank')}
                    className="w-full"
                  >
                    Open Application Form
                  </Button>
                </div>
              ) : scholarshipApplicationForm && scholarshipApplicationForm.form_fields ? (
                <div className="space-y-3">
                  {scholarshipApplicationForm.form_fields.map((field: any) => (
                    <div key={field.id}>
                      <Label htmlFor={field.id}>
                        {field.label} {field.required && <span className="text-destructive">*</span>}
                      </Label>
                      {field.type === "textarea" ? (
                        <Textarea 
                          id={field.id}
                          rows={4}
                          value={applicationFormData[field.id] || ""}
                          onChange={(e) => setApplicationFormData({...applicationFormData, [field.id]: e.target.value})}
                        />
                      ) : field.type === "select" ? (
                        <select
                          id={field.id}
                          className="w-full p-2 border rounded-md"
                          value={applicationFormData[field.id] || ""}
                          onChange={(e) => setApplicationFormData({...applicationFormData, [field.id]: e.target.value})}
                        >
                          <option value="">Select an option</option>
                          {field.options?.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <Input 
                          id={field.id}
                          type={field.type}
                          value={applicationFormData[field.id] || ""}
                          onChange={(e) => setApplicationFormData({...applicationFormData, [field.id]: e.target.value})}
                        />
                      )}
                    </div>
                  ))}
                  <Button 
                    onClick={async () => {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) return;
                      
                      // Validate required fields
                      const missingFields = scholarshipApplicationForm.form_fields.filter((f: any) => 
                        f.required && !applicationFormData[f.id]
                      );
                      
                      if (missingFields.length > 0) {
                        toast({
                          title: "Missing Information",
                          description: "Please fill in all required fields",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      const { error } = await supabase
                        .from("student_applications")
                        .insert({
                          student_id: user.id,
                          scholarship_id: selectedScholarship.id,
                          application_data: applicationFormData,
                          status: "pending"
                        });
                      
                      if (error) {
                        toast({
                          title: "Error",
                          description: "Failed to submit application",
                          variant: "destructive"
                        });
                      } else {
                        toast({
                          title: "Success",
                          description: "Application submitted successfully"
                        });
                        setApplicationFormOpen(false);
                        setApplicationFormData({});
                      }
                    }}
                    className="w-full"
                  >
                    Submit Application
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No application form configured yet</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
