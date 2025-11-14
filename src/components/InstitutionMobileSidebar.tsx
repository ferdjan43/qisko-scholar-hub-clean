import { 
  LayoutDashboard, Building2, FileEdit, Info, 
  GraduationCap, ClipboardCheck, BookOpen, Brain,
  MessageSquare, Handshake, Settings, Shield, LogOut, Moon, Sun
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
}

interface MenuGroup {
  title: string;
  icon: any;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: []
  },
  {
    title: "Institution Profile",
    icon: Building2,
    items: [
      { title: "Profile Management", url: "/institution/profile-management", icon: FileEdit },
      { title: "Customize Profile", url: "/institution/customize-profile", icon: Info },
    ]
  },
  {
    title: "Scholarship",
    icon: GraduationCap,
    items: [
      { title: "Application Review", url: "/institution/application-review", icon: ClipboardCheck },
    ]
  },
  {
    title: "Content Hub",
    icon: BookOpen,
    items: [
      { title: "Learning Materials", url: "/institution/learning-materials", icon: BookOpen },
      { title: "Mock Quizzes", url: "/institution/mock-quizzes", icon: Brain },
    ]
  },
  {
    title: "Community & Interaction",
    icon: MessageSquare,
    items: [
      { title: "Comments & Messages", url: "/institution/messages", icon: MessageSquare },
      { title: "Referrals & Partnerships", url: "/institution/referrals", icon: Handshake },
    ]
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      { title: "Institution Settings", url: "/institution/settings", icon: Settings },
      { title: "Account & Security", url: "/institution/security", icon: Shield },
    ]
  }
];

interface InstitutionMobileSidebarProps {
  onClose: () => void;
}

export function InstitutionMobileSidebar({ onClose }: InstitutionMobileSidebarProps) {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Dashboard"]);
  const [institutionName, setInstitutionName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setEmail(user.email || "");

    const { data } = await supabase
      .from("institution_profiles")
      .select("institution_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setInstitutionName(data.institution_name);
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    onClose();
  };

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupTitle) 
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    );
  };
  
  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12 bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {institutionName.substring(0, 2).toUpperCase() || "IN"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{institutionName || "Institution"}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pt-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.title);
            const hasItems = group.items.length > 0;
            
            return (
              <li key={group.title}>
                {/* Group Header */}
                {hasItems ? (
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <div className="flex items-center gap-3">
                      <group.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{group.title}</span>
                    </div>
                  </button>
                ) : (
                  <NavLink
                    to="/institution"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`
                    }
                  >
                    <group.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{group.title}</span>
                  </NavLink>
                )}

                {/* Submenu Items */}
                {hasItems && isExpanded && (
                  <ul className="mt-1 ml-4 space-y-1">
                    {group.items.map((item) => (
                      <li key={item.title}>
                        <NavLink
                          to={item.url}
                          onClick={onClose}
                          end
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                                isActive
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`
                            }
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border/40 space-y-2">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="text-sm font-medium">Dark Mode</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
