import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Star, Clock, BookOpen, Heart, Play } from "lucide-react";
import { StudentSidebar } from "@/components/StudentSidebar";
import { StudentMobileSidebar } from "@/components/StudentMobileSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Moon } from "lucide-react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudentQuizzes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStudentAccess();
    loadQuizzes();
    loadFavorites();
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

  const loadQuizzes = async () => {
    const { data } = await supabase
      .from("quizzes")
      .select(`
        *,
        institution_profiles (
          institution_name,
          profile_photo_url
        )
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (data) {
      setQuizzes(data);
    }
    setLoading(false);
  };

  const loadFavorites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("quiz_favorites")
      .select(`
        quiz_id,
        quizzes (
          *,
          institution_profiles (
            institution_name,
            profile_photo_url
          )
        )
      `)
      .eq("student_id", user.id);

    if (data) {
      setFavorites(data.map(f => f.quizzes));
    }
  };

  const toggleFavorite = async (quizId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isFavorite = favorites.some(f => f.id === quizId);

    if (isFavorite) {
      await supabase
        .from("quiz_favorites")
        .delete()
        .eq("student_id", user.id)
        .eq("quiz_id", quizId);
      
      toast({ title: "Removed from favorites" });
    } else {
      await supabase
        .from("quiz_favorites")
        .insert({ student_id: user.id, quiz_id: quizId });
      
      toast({ title: "Added to favorites" });
    }

    loadFavorites();
  };

  const startQuiz = (quizId: string) => {
    navigate(`/student/quiz-take/${quizId}`);
  };

  const filteredQuizzes = quizzes.filter(q =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFavorites = favorites.filter(q =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const QuizCard = ({ quiz }: { quiz: any }) => {
    const isFavorite = favorites.some(f => f.id === quiz.id);

    return (
      <Card className={`hover:shadow-lg transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-card'}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center overflow-hidden">
                {quiz.institution_profiles?.profile_photo_url ? (
                  <img src={quiz.institution_profiles.profile_photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{quiz.title}</h3>
                <p className="text-xs text-muted-foreground">{quiz.institution_profiles?.institution_name}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(quiz.id)}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </Button>
          </div>

          {quiz.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{quiz.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            {quiz.question_count > 0 && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{quiz.question_count} questions</span>
              </div>
            )}
            {quiz.time_limit && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{quiz.time_limit} min</span>
              </div>
            )}
            {quiz.difficulty && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                {quiz.difficulty}
              </span>
            )}
          </div>

          <Button onClick={() => startQuiz(quiz.id)} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Take Quiz
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className={`min-h-screen flex ${isDark ? 'dark bg-gray-900' : 'bg-[#FAFBFC]'}`}>
      <StudentSidebar />
      
      <div className="flex-1 flex flex-col md:ml-80">
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

          <h1 className="text-xl font-semibold text-foreground">Quizzes</h1>
          
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="hidden md:flex">
            <Moon className={`h-5 w-5 ${isDark ? 'text-yellow-400' : 'text-muted-foreground'}`} />
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-8">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">
                All Quizzes
                <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                  {filteredQuizzes.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Star className="h-4 w-4 mr-1" />
                Favorites
                <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                  {filteredFavorites.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {filteredQuizzes.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No quizzes available</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredQuizzes.map(quiz => (
                    <QuizCard key={quiz.id} quiz={quiz} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="mt-6">
              {filteredFavorites.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No favorite quizzes yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Click the heart icon on quizzes to add them to favorites
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFavorites.map(quiz => (
                    <QuizCard key={quiz.id} quiz={quiz} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}