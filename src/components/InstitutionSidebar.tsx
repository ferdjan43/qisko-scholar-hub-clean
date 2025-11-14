import { 
  LayoutDashboard, Building2, FileEdit, Info, 
  GraduationCap, ClipboardCheck, BookOpen, Brain,
  MessageSquare, Handshake, Settings, Shield, LogOut
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
      { title: "Customize Profile", url: "/institution/customize-profile", icon: Info },
      { title: "Profile Management", url: "/institution/profile-management", icon: FileEdit },
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

export function InstitutionSidebar() {
  const navigate = useNavigate();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Institution Profile"]);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupTitle) 
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    );
  };
  
  return (
    <aside className="hidden md:flex w-80 flex-col bg-sidebar border-r border-border fixed top-0 left-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="p-6 flex justify-center">
        <img src="/quisko-logo-full.png" alt="QuiSKO Logo" className="h-20 w-auto" />
      </div>

      {/* Create New Button */}
      <div className="px-6 pb-4">
        <Button className="w-full justify-center gap-2 bg-primary hover:bg-primary/90 rounded-full py-6">
          <span className="text-xl">+</span>
          <span>Create New</span>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pt-2 overflow-y-auto">
        <ul className="space-y-6">
          {menuGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.title);
            const hasItems = group.items.length > 0;
            
            return (
              <li key={group.title}>
                {/* Group Header */}
                {hasItems ? (
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className={cn(
                      "flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-colors",
                      "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <group.icon className="h-5 w-5" />
                      <span className="font-medium">{group.title}</span>
                    </div>
                  </button>
                ) : (
                  <NavLink
                    to="/institution"
                    end
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )
                    }
                  >
                    <group.icon className="h-5 w-5" />
                    <span className="font-medium">{group.title}</span>
                  </NavLink>
                )}

                {/* Submenu Items */}
                {hasItems && isExpanded && (
                  <ul className="mt-1 ml-4 space-y-1">
                    {group.items.map((item) => (
                      <li key={item.title}>
                        <NavLink
                          to={item.url}
                          end
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm",
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )
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
          
          {/* Logout Button */}
          <li className="pt-2 border-t border-border mt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground w-full"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>

    </aside>
  );
}
