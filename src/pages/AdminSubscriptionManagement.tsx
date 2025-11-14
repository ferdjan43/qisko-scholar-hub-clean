import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminMobileSidebar } from "@/components/AdminMobileSidebar";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AdminSubscriptionManagement() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    coins: "",
  });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    const { data } = await supabase
      .from("subscription_packages")
      .select("*")
      .order("price", { ascending: true });
    
    if (data) setPackages(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const packageData = {
      name: formData.name,
      price: parseFloat(formData.price),
      coins: parseInt(formData.coins),
      is_active: true,
    };

    if (editingPackage) {
      const { error } = await supabase
        .from("subscription_packages")
        .update(packageData)
        .eq("id", editingPackage.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update package",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Package updated successfully",
        });
      }
    } else {
      const { error } = await supabase
        .from("subscription_packages")
        .insert([packageData]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create package",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Package created successfully",
        });
      }
    }

    setIsDialogOpen(false);
    setEditingPackage(null);
    setFormData({ name: "", price: "", coins: "" });
    loadPackages();
  };

  const handleEdit = (pkg: any) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      price: pkg.price.toString(),
      coins: pkg.coins.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("subscription_packages")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
      loadPackages();
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AdminSidebar />
      
      <main className="flex-1 md:ml-80 max-w-full overflow-x-hidden">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Subscription Management</h1>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <AdminMobileSidebar onClose={() => {}} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Subscription Packages</h2>
              <p className="text-sm md:text-base text-muted-foreground">Manage subscription plans and coin packages</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Package
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingPackage ? "Edit" : "Add"} Subscription Package</DialogTitle>
                  <DialogDescription>
                    Create or update subscription packages with coin rewards
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Package Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Basic Package"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (₱)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="59.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="coins">Coins</Label>
                    <Input
                      id="coins"
                      type="number"
                      value={formData.coins}
                      onChange={(e) => setFormData({ ...formData, coins: e.target.value })}
                      placeholder="24"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingPackage ? "Update" : "Create"} Package
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>₱{pkg.price} / {pkg.coins} coins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(pkg)} className="flex-1">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(pkg.id)} className="flex-1">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}