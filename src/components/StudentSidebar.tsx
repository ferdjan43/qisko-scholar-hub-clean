import { useState, useEffect } from "react";
import { Home, BookOpen, Puzzle, FileText, Users, Coins, Settings, GraduationCap, LogOut, Moon, Sun, ChevronDown } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDarkMode } from "@/contexts/DarkModeContext";

const menuItems = [
  { title: "Dashboard", url: "/student", icon: Home },
  { title: "Scholarships", url: "/student/scholarships", icon: GraduationCap },
  { 
    title: "Quizzes",
    icon: Puzzle,
    submenu: [
      { title: "All Quizzes", url: "/student/quizzes" },
      { title: "Favorites", url: "/student/quizzes#favorites" },
    ]
  },
  { title: "Materials", url: "/student/materials", icon: FileText },
  { title: "Community", url: "/student/community", icon: Users },
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

export function StudentSidebar() {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile) {
        setUserName(profile.full_name || "Student");
      }
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  
  return (
    <aside className="hidden md:flex w-80 flex-col bg-sidebar border-r border-border/40 fixed top-0 left-0 h-screen overflow-y-auto">
      {/* User Profile Section */}
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12 bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {userName.substring(0, 2).toUpperCase() || "ST"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{userName || "Student"}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pt-4">
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
    </aside>
  );
}