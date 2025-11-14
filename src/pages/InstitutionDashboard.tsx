import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bell, Mail, Building2, GraduationCap, FileText, Coins, Eye, Menu, Moon, Plus, X } from "lucide-react";
import { InstitutionSidebar } from "@/components/InstitutionSidebar";
import { InstitutionMobileSidebar } from "@/components/InstitutionMobileSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const InstitutionProfileCustomization = lazy(() => import("@/components/InstitutionProfileCustomization"));
const InstitutionProfileManagement = lazy(() => import("@/components/InstitutionProfileManagement"));

interface InstitutionData {
  institution_name: string;
  institution_type: string;
  contact_number: string;
  address: string;
  approval_status: string;
  description: string;
}

interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  notified: boolean;
}

export default function InstitutionDashboard() {
  const location = useLocation();
  const [institutionData, setInstitutionData] = useState<InstitutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: "", description: "", date: "", time: "" });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDark, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    checkInstitutionAccess();
    fetchInstitutionData();
    loadReminders();
  }, []);

  useEffect(() => {
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [reminders]);

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

  const fetchInstitutionData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("institution_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    setInstitutionData(data);
    setLoading(false);
  };

  const loadReminders = () => {
    const stored = localStorage.getItem('institution_reminders');
    if (stored) {
      const parsed = JSON.parse(stored).map((r: any) => ({
        ...r,
        date: new Date(r.date)
      }));
      setReminders(parsed);
    }
  };

  const saveReminders = (updatedReminders: Reminder[]) => {
    localStorage.setItem('institution_reminders', JSON.stringify(updatedReminders));
    setReminders(updatedReminders);
  };

  const addReminder = () => {
    if (!newReminder.title || !newReminder.date || !newReminder.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      description: newReminder.description,
      date: new Date(newReminder.date),
      time: newReminder.time,
      notified: false
    };

    const updated = [...reminders, reminder];
    saveReminders(updated);
    setNewReminder({ title: "", description: "", date: "", time: "" });
    setIsDialogOpen(false);
    
    toast({
      title: "Reminder Added",
      description: `Reminder set for ${format(reminder.date, 'MMM dd, yyyy')} at ${reminder.time}`
    });
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    saveReminders(updated);
    toast({
      title: "Reminder Deleted",
      description: "Reminder has been removed"
    });
  };

  const checkReminders = () => {
    const now = new Date();
    const updated = reminders.map(reminder => {
      if (!reminder.notified) {
        const reminderDateTime = new Date(reminder.date);
        const [hours, minutes] = reminder.time.split(':');
        reminderDateTime.setHours(parseInt(hours), parseInt(minutes));

        if (now >= reminderDateTime) {
          toast({
            title: "⏰ Reminder!",
            description: reminder.title,
            duration: 10000
          });
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Quisko Reminder', {
              body: reminder.title,
              icon: '/quisko-logo-full.png'
            });
          }
          
          return { ...reminder, notified: true };
        }
      }
      return reminder;
    });
    
    if (JSON.stringify(updated) !== JSON.stringify(reminders)) {
      saveReminders(updated);
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className={`min-h-screen flex w-full ${isDark ? 'dark' : ''}`}>
      <InstitutionSidebar />
      
      <div className="flex-1 flex flex-col md:ml-80">
        {location.pathname === "/institution/customize-profile" ? (
          <>
            <header className="h-16 bg-background flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
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
                <h1 className="text-xl font-semibold text-foreground">Customize Profile</h1>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="hidden md:flex">
                  <Moon className={`h-5 w-5 ${isDark ? 'text-yellow-400' : 'text-muted-foreground'}`} />
                </Button>
                <div className="flex items-center gap-2 md:gap-3">
                  <Avatar className="h-8 w-8 md:h-9 md:w-9">
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {institutionData?.institution_name?.charAt(0).toUpperCase() || "I"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : ''}`}>{institutionData?.institution_name}</p>
                  </div>
                </div>
              </div>
            </header>
            
            <main className="flex-1 p-4 md:p-8 overflow-auto bg-background">
              <Suspense fallback={<div>Loading...</div>}>
                <InstitutionProfileCustomization />
              </Suspense>
            </main>
          </>
        ) : location.pathname === "/institution/profile-management" ? (
          <>
            <header className="h-16 bg-background flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
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
                <h1 className="text-xl font-semibold text-foreground">Profile Management</h1>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="hidden md:flex">
                  <Moon className={`h-5 w-5 ${isDark ? 'text-yellow-400' : 'text-muted-foreground'}`} />
                </Button>
                <div className="flex items-center gap-2 md:gap-3">
                  <Avatar className="h-8 w-8 md:h-9 md:w-9">
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {institutionData?.institution_name?.charAt(0).toUpperCase() || "I"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : ''}`}>{institutionData?.institution_name}</p>
                  </div>
                </div>
              </div>
            </header>
            
            <main className="flex-1 p-4 md:p-8 overflow-auto bg-background">
              <Suspense fallback={<div>Loading...</div>}>
                <InstitutionProfileManagement />
              </Suspense>
            </main>
          </>
        ) : (
          <>
        <header className="h-16 bg-background flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          {/* Mobile Menu */}
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
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="hidden md:flex">
              <Moon className={`h-5 w-5 ${isDark ? 'text-yellow-400' : 'text-muted-foreground'}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={requestNotificationPermission} className="hidden md:flex">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div className="flex items-center gap-2 md:gap-3">
              <Avatar className="h-8 w-8 md:h-9 md:w-9">
                <AvatarFallback className="bg-primary text-white text-sm">
                  {institutionData?.institution_name?.charAt(0).toUpperCase() || "I"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : ''}`}>{institutionData?.institution_name}</p>
              </div>
            </div>
          </div>
        </header>

          <main className="flex-1 p-4 md:p-8 overflow-auto bg-background max-w-full">
            {/* Top Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Progress Card */}
              <div className="lg:col-span-2 bg-card rounded-2xl p-6 border-0">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                      Hi, {institutionData?.institution_name}!
                    </h2>
                    <p className="text-muted-foreground">
                      You have managed <span className="font-semibold text-foreground">6 scholarships</span> this month!
                    </p>
                    <Button variant="secondary" size="sm" className="mt-4 rounded-full">
                      SEE ALL →
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <Card className="bg-[#F59E0B] text-white border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm opacity-90">Active Posts</p>
                      </div>
                      <GraduationCap className="h-8 w-8 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#6366F1] text-white border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm opacity-90">Applications</p>
                      </div>
                      <FileText className="h-8 w-8 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Statistics & Assignments */}
              <div className="lg:col-span-2 space-y-6">
                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-card border-0">
                    <CardContent className="p-6 text-center">
                      <p className="text-3xl font-bold text-foreground">0</p>
                      <p className="text-sm text-muted-foreground">Scholarships posted</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-0">
                    <CardContent className="p-6 text-center">
                      <p className="text-3xl font-bold text-foreground">0</p>
                      <p className="text-sm text-muted-foreground">In progress</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-0">
                    <CardContent className="p-6 text-center">
                      <p className="text-3xl font-bold text-foreground">0</p>
                      <p className="text-sm text-muted-foreground">Hours managed</p>
                    </CardContent>
                  </Card>
                </div>

                {/* My Assignments */}
                <Card className="bg-card border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>My Tasks</CardTitle>
                      <Button variant="ghost" size="sm">View all</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-[#FEF3C7] hover:bg-[#FDE68A] transition-colors cursor-pointer">
                      <div className="w-12 h-12 rounded-lg bg-[#F59E0B] flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">Review Scholarship Applications</p>
                        <p className="text-sm text-muted-foreground">STEM Scholarship 2025</p>
                      </div>
                      <p className="text-sm text-muted-foreground">15 Dec, 2025</p>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-lg bg-[#E0E7FF] hover:bg-[#C7D2FE] transition-colors cursor-pointer">
                      <div className="w-12 h-12 rounded-lg bg-[#6366F1] flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">Post New Scholarship</p>
                        <p className="text-sm text-muted-foreground">Engineering Excellence Award</p>
                      </div>
                      <p className="text-sm text-muted-foreground">20 Dec, 2025</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Calendar & Upcoming */}
              <div className="space-y-6">
                {/* Calendar */}
                <Card className="bg-card border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{format(selectedDate, 'MMMM yyyy')}</CardTitle>
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card">
                          <DialogHeader>
                            <DialogTitle>Add Reminder</DialogTitle>
                            <DialogDescription>
                              Set a reminder for your scholarship tasks
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="title">Title*</Label>
                              <Input
                                id="title"
                                value={newReminder.title}
                                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                                placeholder="Review applications"
                              />
                            </div>
                            <div>
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                value={newReminder.description}
                                onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                                placeholder="Add details..."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="date">Date*</Label>
                                <Input
                                  id="date"
                                  type="date"
                                  value={newReminder.date}
                                  onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="time">Time*</Label>
                                <Input
                                  id="time"
                                  type="time"
                                  value={newReminder.time}
                                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                                />
                              </div>
                            </div>
                            <Button onClick={addReminder} className="w-full">
                              Add Reminder
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2 text-center mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-xs text-muted-foreground font-medium">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                        const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                        const hasReminder = reminders.some(r => 
                          r.date.toDateString() === currentDate.toDateString()
                        );
                        return (
                          <Button
                            key={day}
                            variant={hasReminder ? "default" : "ghost"}
                            size="sm"
                            className={`h-8 w-8 p-0 relative ${hasReminder ? 'bg-primary text-white' : ''}`}
                          >
                            {day}
                            {hasReminder && <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-yellow-400 rounded-full" />}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Reminders */}
                <Card className="bg-card border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Reminders</CardTitle>
                      <Badge variant="secondary">{reminders.filter(r => !r.notified).length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {reminders.filter(r => !r.notified).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No upcoming reminders</p>
                    ) : (
                      reminders
                        .filter(r => !r.notified)
                        .sort((a, b) => a.date.getTime() - b.date.getTime())
                        .map(reminder => (
                          <div key={reminder.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Bell className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{reminder.title}</p>
                              {reminder.description && (
                                <p className="text-xs text-muted-foreground truncate">{reminder.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(reminder.date, 'MMM dd, yyyy')} at {reminder.time}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteReminder(reminder.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
          </>
        )}
      </div>
    </div>
  );
}
