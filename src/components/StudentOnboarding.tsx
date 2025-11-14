import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Target, MapPin, BookOpen, ChevronRight, ChevronLeft, Award, Sparkles } from "lucide-react";
import onboardingCharacter from "@/assets/onboarding-character.png";

interface Props {
  onComplete: () => void;
}

export default function StudentOnboarding({ onComplete }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    field_of_study: "",
    academic_level: "",
    gpa: "",
    interests: [] as string[],
    preferred_scholarship_types: [] as string[],
    location_preference: "",
    skills: [] as string[],
    extracurricular: [] as string[],
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const fieldOfStudyOptions = [
    "Education", "Engineering", "Information Technology", "Business Administration",
    "Nursing", "Medicine", "Law", "Arts & Design", "Agriculture", "Social Sciences"
  ];

  const academicLevelOptions = [
    "High School", "College Freshman", "College Sophomore", "College Junior", 
    "College Senior", "Graduate Student", "Postgraduate"
  ];

  const interestOptions = [
    "STEM", "Arts", "Business", "Medicine", "Engineering", 
    "Technology", "Social Sciences", "Environmental Studies", "Education", "Law"
  ];

  const scholarshipTypeOptions = [
    "Merit-based", "Need-based", "Athletic", "Academic", 
    "Research", "Community Service", "International", "Indigenous Peoples"
  ];

  const skillOptions = [
    "Leadership", "Public Speaking", "Research", "Writing", "Problem Solving",
    "Teamwork", "Critical Thinking", "Data Analysis", "Programming", "Creative Arts"
  ];

  const extracurricularOptions = [
    "Student Government", "Sports", "Music/Arts", "Debate", "Community Service",
    "Academic Clubs", "Cultural Organizations", "Environmental Groups"
  ];

  const locationOptions = [
    "National Capital Region (NCR)", "Luzon", "Visayas", "Mindanao", 
    "No Preference", "International"
  ];

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("student_profiles")
        .insert({
          student_id: user.id,
          completed_onboarding: true,
          ...formData,
          gpa: formData.gpa ? parseFloat(formData.gpa) : null,
        });

      if (error) throw error;

      toast({
        title: "Welcome to QuiSKO!",
        description: "Your profile has been set up successfully",
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const toggleScholarshipType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_scholarship_types: prev.preferred_scholarship_types.includes(type)
        ? prev.preferred_scholarship_types.filter(t => t !== type)
        : [...prev.preferred_scholarship_types, type]
    }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const toggleExtracurricular = (activity: string) => {
    setFormData(prev => ({
      ...prev,
      extracurricular: prev.extracurricular.includes(activity)
        ? prev.extracurricular.filter(a => a !== activity)
        : [...prev.extracurricular, activity]
    }));
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl shadow-2xl border-2 border-primary/20 my-8">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left Side - Illustration */}
            <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-primary to-primary/80 p-8 flex-col justify-center items-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
              
              <div className="relative z-10 text-center">
                <img src={onboardingCharacter} alt="Student" className="w-48 h-48 object-contain mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-3">Start Your Journey</h2>
                <p className="text-white/90 text-sm">We'll help you find the perfect scholarships tailored to your goals and qualifications.</p>
                
                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-white text-primary' : 'bg-white/20 text-white'}`}>
                      {step > 1 ? '✓' : '1'}
                    </div>
                    <span className="text-sm">Academic Info</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-white text-primary' : 'bg-white/20 text-white'}`}>
                      {step > 2 ? '✓' : '2'}
                    </div>
                    <span className="text-sm">Interests</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-white text-primary' : 'bg-white/20 text-white'}`}>
                      {step > 3 ? '✓' : '3'}
                    </div>
                    <span className="text-sm">Scholarships</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-white text-primary' : 'bg-white/20 text-white'}`}>
                      {step > 4 ? '✓' : '4'}
                    </div>
                    <span className="text-sm">Skills</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 5 ? 'bg-white text-primary' : 'bg-white/20 text-white'}`}>
                      {step > 5 ? '✓' : '5'}
                    </div>
                    <span className="text-sm">Location</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 p-8">
              {/* Mobile Header */}
              <div className="md:hidden text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to QuiSKO!</h1>
                <p className="text-sm text-muted-foreground">Let's personalize your scholarship journey</p>
              </div>

              {/* Desktop Header */}
              <div className="hidden md:block mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to QuiSKO!</h1>
                <p className="text-muted-foreground">Let's personalize your scholarship journey</p>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Step {step} of {totalSteps}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Step 1: Academic Information */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Academic Information</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Field of Study</Label>
                      <Select
                        value={formData.field_of_study}
                        onValueChange={(value) => setFormData({ ...formData, field_of_study: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your field" />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldOfStudyOptions.map(field => (
                            <SelectItem key={field} value={field}>{field}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Academic Level</Label>
                      <Select
                        value={formData.academic_level}
                        onValueChange={(value) => setFormData({ ...formData, academic_level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your level" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicLevelOptions.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Average Grade (Optional)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="75"
                        max="100"
                        placeholder="e.g., 88.5 (Philippine grading: 75-100)"
                        value={formData.gpa}
                        onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Enter your average grade (75-100)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Interests */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Your Interests</h2>
                  </div>

                  <div className="space-y-4">
                    <Label>What fields are you interested in?</Label>
                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {interestOptions.map((interest) => (
                        <div key={interest} className="flex items-center space-x-2">
                          <Checkbox
                            id={`interest-${interest}`}
                            checked={formData.interests.includes(interest)}
                            onCheckedChange={() => toggleInterest(interest)}
                          />
                          <label
                            htmlFor={`interest-${interest}`}
                            className="text-sm cursor-pointer"
                          >
                            {interest}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Scholarship Preferences */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Scholarship Preferences</h2>
                  </div>

                  <div className="space-y-4">
                    <Label>What type of scholarships are you interested in?</Label>
                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {scholarshipTypeOptions.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`scholarship-${type}`}
                            checked={formData.preferred_scholarship_types.includes(type)}
                            onCheckedChange={() => toggleScholarshipType(type)}
                          />
                          <label
                            htmlFor={`scholarship-${type}`}
                            className="text-sm cursor-pointer"
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Skills & Activities */}
              {step === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Skills & Activities</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Your Key Skills</Label>
                      <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto mt-2">
                        {skillOptions.map((skill) => (
                          <div key={skill} className="flex items-center space-x-2">
                            <Checkbox
                              id={`skill-${skill}`}
                              checked={formData.skills.includes(skill)}
                              onCheckedChange={() => toggleSkill(skill)}
                            />
                            <label htmlFor={`skill-${skill}`} className="text-sm cursor-pointer">
                              {skill}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Extracurricular Activities</Label>
                      <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto mt-2">
                        {extracurricularOptions.map((activity) => (
                          <div key={activity} className="flex items-center space-x-2">
                            <Checkbox
                              id={`extra-${activity}`}
                              checked={formData.extracurricular.includes(activity)}
                              onCheckedChange={() => toggleExtracurricular(activity)}
                            />
                            <label htmlFor={`extra-${activity}`} className="text-sm cursor-pointer">
                              {activity}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Location Preference */}
              {step === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Location Preference</h2>
                  </div>

                  <div className="space-y-4">
                    <Label>Where would you like to study?</Label>
                    <Select
                      value={formData.location_preference}
                      onValueChange={(value) => setFormData({ ...formData, location_preference: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationOptions.map(location => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
                {step < totalSteps && (
                  <Button
                    onClick={handleNext}
                    className="ml-auto gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
                {step === totalSteps && (
                  <Button
                    onClick={handleComplete}
                    className="ml-auto gap-2 bg-gradient-to-r from-primary to-primary/80"
                  >
                    Complete Setup
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
