import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstitutionSidebar } from "@/components/InstitutionSidebar";
import { InstitutionMobileSidebar } from "@/components/InstitutionMobileSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Brain, Plus, Trash2, Bell, Menu, Moon, Edit, Eye } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: string;
  question: string;
  type: "multiple_choice" | "true_false";
  options?: string[];
  correct_answer: string;
}

export default function InstitutionMockQuizzes() {
  const [userName, setUserName] = useState("");
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [institutionId, setInstitutionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizSubject, setQuizSubject] = useState("");
  const [quizDifficulty, setQuizDifficulty] = useState("medium");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentType, setCurrentType] = useState<"multiple_choice" | "true_false">("multiple_choice");
  const [currentOptions, setCurrentOptions] = useState(["", "", "", ""]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const { isDark, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkInstitutionAccess();
    fetchUserData();
    loadQuizzes();
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

  const loadQuizzes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("institution_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) return;

    const { data } = await supabase
      .from("quizzes")
      .select("*")
      .eq("institution_id", profile.id)
      .order("created_at", { ascending: false });

    if (data) {
      setQuizzes(data);
    }
  };

  const addQuestion = () => {
    if (!currentQuestion || !currentAnswer) {
      toast({
        title: "Missing fields",
        description: "Please fill in the question and answer",
        variant: "destructive",
      });
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      question: currentQuestion,
      type: currentType,
      options: currentType === "multiple_choice" ? currentOptions.filter(o => o.trim()) : ["True", "False"],
      correct_answer: currentAnswer,
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion("");
    setCurrentOptions(["", "", "", ""]);
    setCurrentAnswer("");
  };

  const createQuiz = async () => {
    if (!quizTitle || !quizSubject || questions.length === 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields and add at least one question",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("quizzes")
        .insert([{
          institution_id: institutionId,
          title: quizTitle,
          description: quizDescription,
          subject: quizSubject,
          difficulty: quizDifficulty,
          question_count: questions.length,
          status: "published",
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz created successfully",
      });

      setShowCreateDialog(false);
      setQuizTitle("");
      setQuizDescription("");
      setQuizSubject("");
      setQuestions([]);
      loadQuizzes();
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
      .from("quizzes")
      .delete()
      .eq("id", id);

    if (!error) {
      toast({ title: "Quiz deleted" });
      loadQuizzes();
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
        <header className={`h-16 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 border-b`}>
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
            <h1 className="text-xl font-semibold text-foreground">Mock Quizzes</h1>
            <p className="text-xs text-muted-foreground">Create and manage quizzes</p>
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
            <h2 className="text-2xl font-bold text-foreground">My Quizzes</h2>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </div>

          {quizzes.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No quizzes created yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-1">{quiz.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {quiz.subject} • {quiz.question_count} questions
                        </p>
                      </div>
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex gap-2">
                      <Badge variant="secondary">{quiz.difficulty}</Badge>
                      <Badge variant="outline">{quiz.status}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        onClick={() => handleDelete(quiz.id)}
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

      {/* Create Quiz Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Quiz Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Mathematics Quiz 1"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics"
                  value={quizSubject}
                  onChange={(e) => setQuizSubject(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Quiz description..."
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
              />
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={quizDifficulty} onValueChange={setQuizDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Add Questions ({questions.length})</h3>
              
              <div className="space-y-3 mb-4">
                <div>
                  <Label>Question Type</Label>
                  <Select value={currentType} onValueChange={(v: any) => setCurrentType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True/False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Question *</Label>
                  <Input
                    placeholder="Enter your question"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                  />
                </div>
                {currentType === "multiple_choice" && (
                  <div className="grid grid-cols-2 gap-2">
                    {currentOptions.map((opt, i) => (
                      <Input
                        key={i}
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...currentOptions];
                          newOpts[i] = e.target.value;
                          setCurrentOptions(newOpts);
                        }}
                      />
                    ))}
                  </div>
                )}
                <div>
                  <Label>Correct Answer *</Label>
                  <Input
                    placeholder={currentType === "true_false" ? "True or False" : "Correct answer"}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                  />
                </div>
                <Button onClick={addQuestion} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {questions.length > 0 && (
                <div className="space-y-2">
                  {questions.map((q, i) => (
                    <div key={q.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{i + 1}. {q.question}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Answer: {q.correct_answer}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setQuestions(questions.filter(qq => qq.id !== q.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={createQuiz} disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Quiz"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
