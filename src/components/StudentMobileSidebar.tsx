import { Home, BookOpen, User, GraduationCap, FileText, Settings, LogOut, Moon, Sun, Coins, ChevronDown } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  { title: "Dashboard", url: "/student", icon: Home },
  { title: "Scholarships", url: "/student/scholarships", icon: GraduationCap },
  { title: "Quizzes", url: "/student/quizzes", icon: BookOpen },
  { title: "Materials", url: "/student/materials", icon: FileText },
  { 
    title: "Coins & Rewards", 
    icon: Coins,
    submenu: [
      { title: "Refer & Earn", url: "/student/refer-earn" },
      { title: "Subscription", url: "/student/subscription" },
    ]
  },
  { title: "Settings", url: "/student/settings", icon: Settings },
];

interface StudentMobileSidebarProps {
  onClose: () => void;
}

export function StudentMobileSidebar({ onClose }: StudentMobileSidebarProps) {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setEmail(user.email || "");

    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      setUserName(data.full_name || "Student");
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    onClose();
  };
  
  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-center mb-4">
          <img src="/quisko-logo-full.png" alt="QuiSKO Logo" className="h-16 w-auto" />
        </div>

        {/* User Profile */}
        <div className="flex flex-col items-center text-center py-4">
          <Avatar className="h-16 w-16 mb-3">
            <AvatarFallback className="bg-primary text-white text-lg">
              {userName?.charAt(0).toUpperCase() || "S"}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-foreground">{userName || "Student"}</h3>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pt-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.title}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => setExpandedMenu(expandedMenu === item.title ? null : item.title)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedMenu === item.title ? "rotate-180" : ""}`} />
                  </button>
                  {expandedMenu === item.title && (
                    <ul className="ml-6 mt-1 space-y-1">
                      {item.submenu.map((subitem) => (
                        <li key={subitem.title}>
                          <NavLink
                            to={subitem.url}
                            onClick={onClose}
                            end
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                                isActive
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`
                            }
                          >
                            {subitem.title}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.url}
                  onClick={onClose}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.title}</span>
                </NavLink>
              )}
            </li>
          ))}
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
