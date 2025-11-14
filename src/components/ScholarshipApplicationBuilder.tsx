import { useState, useEffect } from "react";
import { Plus, X, GripVertical, Link as LinkIcon, FormInput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

interface Props {
  scholarshipId: string;
  onSave: () => void;
  applicationDate?: string;
}

export default function ScholarshipApplicationBuilder({ scholarshipId, onSave, applicationDate }: Props) {
  const { toast } = useToast();
  const [formType, setFormType] = useState<"external_link" | "custom_form">("custom_form");
  const [externalLink, setExternalLink] = useState("");
  const [formFields, setFormFields] = useState<FormField[]>([
    { id: "1", type: "text", label: "Full Name", required: true },
    { id: "2", type: "email", label: "Email Address", required: true },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExistingApplication();
  }, [scholarshipId]);

  const loadExistingApplication = async () => {
    const { data } = await supabase
      .from("scholarship_applications")
      .select("*")
      .eq("scholarship_id", scholarshipId)
      .single();

    if (data) {
      setFormType(data.form_type as any);
      if (data.external_link) setExternalLink(data.external_link);
      if (data.form_fields) setFormFields(data.form_fields as any);
    }
  };

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: "text",
      label: "",
      required: false,
    };
    setFormFields([...formFields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFormFields(formFields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    setFormFields(formFields.filter(field => field.id !== id));
  };

  const saveApplication = async () => {
    if (formType === "external_link" && !externalLink) {
      toast({
        title: "Missing Link",
        description: "Please provide an external link",
        variant: "destructive",
      });
      return;
    }

    if (formType === "custom_form" && formFields.length === 0) {
      toast({
        title: "No Fields",
        description: "Please add at least one form field",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if application exists
      const { data: existing } = await supabase
        .from("scholarship_applications")
        .select("id")
        .eq("scholarship_id", scholarshipId)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("scholarship_applications")
          .update({
            form_type: formType,
            external_link: formType === "external_link" ? externalLink : null,
            form_fields: formType === "custom_form" ? (formFields as any) : [],
          })
          .eq("scholarship_id", scholarshipId);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("scholarship_applications")
          .insert([{
            scholarship_id: scholarshipId,
            form_type: formType,
            external_link: formType === "external_link" ? externalLink : null,
            form_fields: formType === "custom_form" ? (formFields as any) : [],
          }]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Application form saved successfully",
      });
      
      onSave();
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

  return (
    <div className="space-y-6">
      <Card className="bg-muted/30">
        <CardContent className="p-4 md:p-6">
          <h3 className="font-semibold text-foreground mb-2">Choose Application Method</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select whether you want to create a custom application form or use an external link (like Google Forms)
          </p>
        </CardContent>
      </Card>

      <Tabs value={formType} onValueChange={(value) => setFormType(value as any)}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="custom_form" className="gap-2">
            <FormInput className="h-4 w-4" />
            <span className="hidden md:inline">Create</span> Custom Form
          </TabsTrigger>
          <TabsTrigger value="external_link" className="gap-2">
            <LinkIcon className="h-4 w-4" />
            <span className="hidden md:inline">Use</span> External Link
          </TabsTrigger>
        </TabsList>

        <TabsContent value="external_link" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>External Application Link</CardTitle>
              <CardDescription>
                Already have a Google Form or external registration system? Just paste the link here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="external-link">Application URL *</Label>
                  <Input
                    id="external-link"
                    type="url"
                    placeholder="https://forms.google.com/... or https://your-website.com/apply"
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Students will be redirected to this link when they apply for the scholarship
                  </p>
                </div>
                <Button onClick={saveApplication} disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Save Application Link"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom_form" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                <div className="flex-1">
                  <CardTitle>Custom Application Form</CardTitle>
                  <CardDescription>
                    Build a customizable application form similar to Google Forms. Add questions, set field types, and make them required or optional.
                  </CardDescription>
                </div>
                <Button onClick={addField} variant="outline" size="sm" className="gap-2 whitespace-nowrap">
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FormInput className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No questions yet. Click "Add Question" to get started!</p>
                </div>
              )}
              
              {formFields.map((field, index) => (
                <Card key={field.id} className="p-4 bg-muted/30">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1 pt-2">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                      <span className="text-xs text-muted-foreground">#{index + 1}</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-semibold">Question / Field Label *</Label>
                          <Input
                            placeholder="e.g., What is your GPA?"
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">Answer Type *</Label>
                          <Select value={field.type} onValueChange={(value) => updateField(field.id, { type: value })}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Short Text</SelectItem>
                              <SelectItem value="textarea">Long Text (Paragraph)</SelectItem>
                              <SelectItem value="email">Email Address</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="tel">Phone Number</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="select">Dropdown (Select One)</SelectItem>
                              <SelectItem value="radio">Multiple Choice (Radio)</SelectItem>
                              <SelectItem value="checkbox">Checkboxes (Select Multiple)</SelectItem>
                              <SelectItem value="file">File Upload</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                        <div>
                          <Label>Options (comma separated)</Label>
                          <Input
                            placeholder="Option 1, Option 2, Option 3"
                            value={field.options?.join(", ") || ""}
                            onChange={(e) => updateField(field.id, { options: e.target.value.split(",").map(s => s.trim()) })}
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`required-${field.id}`}
                          checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor={`required-${field.id}`} className="cursor-pointer">Required field</Label>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeField(field.id)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              <Button onClick={saveApplication} disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Application Form"}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formFields.map((field) => (
                <div key={field.id}>
                  <Label>
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea placeholder={`Enter ${field.label.toLowerCase()}`} disabled />
                  ) : field.type === "select" ? (
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </Select>
                  ) : (
                    <Input type={field.type} placeholder={`Enter ${field.label.toLowerCase()}`} disabled />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
