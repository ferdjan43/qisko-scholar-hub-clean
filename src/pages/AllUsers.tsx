import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Ban, Bell, Mail, Menu } from "lucide-react";
import { AdminMobileSidebar } from "@/components/AdminMobileSidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Moon, Sun } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  roles?: string[];
  isBanned?: boolean;
}

export default function AllUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("7");
  const [banUnit, setBanUnit] = useState("days");
  const [pendingCount, setPendingCount] = useState(0);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDark, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    checkAdminAccess();
    fetchData();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some(r => r.role === "admin");
    if (!isAdmin) {
      navigate("/");
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have admin privileges.",
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();
      setUserName(profile?.full_name || profile?.email || "Admin");
    }

    // Fetch pending institutions count
    const { data: pendingInst } = await supabase
      .from("institution_profiles")
      .select("id", { count: "exact" })
      .eq("approval_status", "pending");
    setPendingCount(pendingInst?.length || 0);

    const { data: usersData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (usersData) {
      // Filter out users with pending institution approval
      const usersWithRoles = await Promise.all(
        usersData.map(async (user) => {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);
          
          // Check if user is an institution with pending approval
          const hasInstitutionRole = roles?.some(r => r.role === "institution");
          if (hasInstitutionRole) {
            const { data: institutionProfile } = await supabase
              .from("institution_profiles")
              .select("approval_status")
              .eq("user_id", user.id)
              .maybeSingle();
            
            // Skip users with pending or rejected institution approval
            if (institutionProfile?.approval_status === "pending" || institutionProfile?.approval_status === "rejected") {
              return null;
            }
          }
          
          const { data: bans } = await supabase
            .from("user_bans")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .gte("banned_until", new Date().toISOString())
            .maybeSingle();
          
          return { 
            ...user, 
            roles: roles?.map(r => r.role) || [],
            isBanned: !!bans
          };
        })
      );
      // Filter out null values (pending institutions)
      setUsers(usersWithRoles.filter(u => u !== null) as UserProfile[]);
    }
    
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      // Check for both error object and error in response data
      if (error || (data && data.error)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error?.message || data?.error || "Failed to delete user",
        });
        setUserToDelete(null);
        return;
      }

      // Update state immediately without full refresh
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      toast({
        title: "User deleted",
        description: "The user has been permanently deleted.",
      });
      
      setUserToDelete(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete user",
      });
      setUserToDelete(null);
    }
  };

  const handleEditRole = async () => {
    if (!selectedUser || !newRole) return;

    // Remove existing roles
    await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", selectedUser.id);

    // Add new role
    const { error } = await supabase
      .from("user_roles")
      .insert([{ user_id: selectedUser.id, role: newRole as "admin" | "institution" | "student" }]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Role updated",
      description: `User role has been changed to ${newRole}.`,
    });
    setSelectedUser(null);
    fetchData();
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banReason) return;

    const duration = parseInt(banDuration);
    const bannedUntil = new Date();
    
    if (banUnit === "days") {
      bannedUntil.setDate(bannedUntil.getDate() + duration);
    } else if (banUnit === "weeks") {
      bannedUntil.setDate(bannedUntil.getDate() + duration * 7);
    } else if (banUnit === "months") {
      bannedUntil.setMonth(bannedUntil.getMonth() + duration);
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("user_bans")
      .insert({
        user_id: selectedUser.id,
        banned_by: user?.id,
        reason: banReason,
        banned_until: bannedUntil.toISOString(),
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      return;
    }

    toast({
      title: "User banned",
      description: `User has been banned until ${bannedUntil.toLocaleDateString()}.`,
    });
    setSelectedUser(null);
    setBanReason("");
    fetchData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
        
      <div className="flex-1 flex flex-col md:ml-80">
        <header className="h-16 bg-card flex items-center justify-between px-4 md:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <AdminMobileSidebar onClose={() => {}} />
            </SheetContent>
          </Sheet>

          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-foreground">All Users</h1>
            <p className="text-xs text-muted-foreground">Manage user accounts and permissions</p>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex relative"
              onClick={() => navigate("/admin/account-confirmation")}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Button>
            <div className="flex items-center gap-2 md:gap-3">
              <Avatar className="h-8 w-8 md:h-9 md:w-9">
                <AvatarFallback className="bg-primary text-white text-sm">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{userName}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage all user accounts in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.roles?.map(role => (
                          <Badge key={role} className="mr-1">
                            {role}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        {user.isBanned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewRole(user.roles?.[0] || "");
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User Role</DialogTitle>
                                <DialogDescription>
                                  Change the role for {user.full_name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Select Role</Label>
                                  <Select value={newRole} onValueChange={setNewRole}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="institution">Institution</SelectItem>
                                      <SelectItem value="student">Student</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleEditRole}>Update Role</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Ban User</DialogTitle>
                                <DialogDescription>
                                  Temporarily ban {user.full_name} from accessing the system
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Reason</Label>
                                  <Textarea
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    placeholder="Reason for banning..."
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Duration</Label>
                                    <Input
                                      type="number"
                                      value={banDuration}
                                      onChange={(e) => setBanDuration(e.target.value)}
                                      min="1"
                                    />
                                  </div>
                                  <div>
                                    <Label>Unit</Label>
                                    <Select value={banUnit} onValueChange={setBanUnit}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="days">Days</SelectItem>
                                        <SelectItem value="weeks">Weeks</SelectItem>
                                        <SelectItem value="months">Months</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="destructive" onClick={handleBanUser}>
                                  Ban User
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {/* Only show delete button if not viewing your own account */}
                          {user.id !== currentUserId && (
                            <Dialog open={userToDelete === user.id} onOpenChange={(open) => !open && setUserToDelete(null)}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setUserToDelete(user.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete User</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete {user.full_name}? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setUserToDelete(null)}>
                                    Cancel
                                  </Button>
                                  <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                                    Delete User
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
