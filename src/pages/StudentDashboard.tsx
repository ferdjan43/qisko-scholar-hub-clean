import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Bell, TrendingUp, CheckCircle, Eye, Target, Edit, Trash2, Globe, Lock, Menu, Moon, Plus, Calendar, Clock } from "lucide-react";
import { StudentSidebar } from "@/components/StudentSidebar";
import { StudentMobileSidebar } from "@/components/StudentMobileSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import heroImage from "@/assets/dashboard-hero.png";
import StudentOnboarding from "@/components/StudentOnboarding";

export default function StudentDashboard() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskColor, setTaskColor] = useState("#6366f1");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDark, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    checkStudentAccess();
    fetchUserData();
    loadTasks();
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("student_profiles")
      .select("completed_onboarding")
      .eq("student_id", user.id)
      .maybeSingle();

    if (!data || !data.completed_onboarding) {
      setShowOnboarding(true);
    }
  };

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
    setLoading(false);
  };

  const loadTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("student_tasks")
      .select("*")
      .eq("student_id", user.id)
      .order("due_date", { ascending: true });

    if (data) {
      setTasks(data);
    }
  };

  const createTask = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!taskTitle || !taskDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in title and date",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("student_tasks")
      .insert([{
        student_id: user.id,
        title: taskTitle,
        description: taskDescription,
        due_date: taskDate,
        color: taskColor,
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Task created",
      });
      setShowTaskDialog(false);
      setTaskTitle("");
      setTaskDescription("");
      setTaskDate("");
      loadTasks();
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from("student_tasks")
      .delete()
      .eq("id", id);

    if (!error) {
      toast({ title: "Task deleted" });
      loadTasks();
    }
  };

  const toggleTaskComplete = async (id: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from("student_tasks")
      .update({ is_completed: !isCompleted })
      .eq("id", id);

    if (!error) {
      loadTasks();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const activities = [
    {
      id: 1,
      title: "DOST Scholarship Mock Exam",
      description: "Took exam on January 15, 2025",
      isPublic: true,
      color: "bg-[#F59E0B]"
    },
    {
      id: 2,
      title: "CHED Scholarship Application",
      description: "Applied on January 10, 2025",
      isPublic: false,
      color: "bg-[#6366F1]"
    },
  ];

  return (
    <>
      {showOnboarding && <StudentOnboarding onComplete={() => setShowOnboarding(false)} />}
      
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
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
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
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-[#E8E6FF] to-[#F5F3FF] rounded-2xl p-6 md:p-8 mb-6 md:mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Hi, {userName.split(' ')[0]}!
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Ready to explore scholarships?
              </p>
            </div>
            <div className="hidden md:block">
              <img src={heroImage} alt="Dashboard hero" className="h-32 md:h-40 object-contain" />
            </div>
          </div>


          {/* Stats Cards */}
          <h3 className="text-sm text-muted-foreground mb-4">Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <Card className="p-4 md:p-6 bg-[#FBBF24] border-0 text-white">
              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-white/20 rounded-lg">
                  <Target className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl md:text-3xl font-bold">83%</p>
                  <p className="text-xs md:text-sm opacity-90">Goal</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 md:p-6 bg-[#6366F1] border-0 text-white">
              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-white/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl md:text-3xl font-bold">77%</p>
                  <p className="text-xs md:text-sm opacity-90">Done</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 md:p-6 bg-[#EC4899] border-0 text-white">
              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-white/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl md:text-3xl font-bold">91</p>
                  <p className="text-xs md:text-sm opacity-90">Unique</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 md:p-6 bg-[#A78BFA] border-0 text-white">
              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-white/20 rounded-lg">
                  <Eye className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl md:text-3xl font-bold">126</p>
                  <p className="text-xs md:text-sm opacity-90">Views</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tasks & Reminders */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Tasks & Reminders</h3>
              <Button onClick={() => setShowTaskDialog(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
            <div className="space-y-3">
              {tasks.filter(t => !t.is_completed).slice(0, 6).map((task) => (
                <Card 
                  key={task.id} 
                  className={`overflow-hidden hover:shadow-md transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-card'}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: task.color }}
                        >
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground line-clamp-1">{task.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => toggleTaskComplete(task.id, task.is_completed)}
                        >
                          <Switch checked={task.is_completed} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => deleteTask(task.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {tasks.filter(t => !t.is_completed).length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No upcoming tasks</p>
                    <Button onClick={() => setShowTaskDialog(true)} variant="link" className="mt-2">
                      Create your first task
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          {/* Activities Section */}
          <div className="space-y-3 md:space-y-4">
            {activities.map((activity) => (
              <Card key={activity.id} className="p-4 bg-white border border-border hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className={`w-12 h-12 md:w-16 md:h-16 ${activity.color} rounded-lg flex-shrink-0`} />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1 text-sm md:text-base">{activity.title}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">{activity.description}</p>
                  </div>

                  <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center gap-2">
                      {activity.isPublic ? (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Switch checked={activity.isPublic} />
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a reminder for important deadlines</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Title *</Label>
              <Input
                id="task-title"
                placeholder="e.g., Submit scholarship application"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                placeholder="Additional details..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="task-date">Due Date & Time *</Label>
              <Input
                id="task-date"
                type="datetime-local"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="task-color">Color</Label>
              <div className="flex gap-2">
                {['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setTaskColor(color)}
                    className={`w-8 h-8 rounded-full ${taskColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={createTask} className="w-full">Create Task</Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}