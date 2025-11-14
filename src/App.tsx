import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import AllUsers from "./pages/AllUsers";
import AccountConfirmation from "./pages/AccountConfirmation";
import AdminSubscriptionManagement from "./pages/AdminSubscriptionManagement";
import InstitutionDashboard from "./pages/InstitutionDashboard";
import InstitutionLearningMaterials from "./pages/InstitutionLearningMaterials";
import InstitutionMockQuizzes from "./pages/InstitutionMockQuizzes";
import StudentDashboard from "./pages/StudentDashboard";
import StudentScholarships from "./pages/StudentScholarships";
import StudentReferEarn from "./pages/StudentReferEarn";
import StudentSubscription from "./pages/StudentSubscription";
import StudentMaterials from "./pages/StudentMaterials";
import StudentQuizzes from "./pages/StudentQuizzes";
import StudentQuizTake from "./pages/StudentQuizTake";
import ApplicationReview from "./pages/ApplicationReview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DarkModeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AllUsers />} />
            <Route path="/admin/account-confirmation" element={<AccountConfirmation />} />
            <Route path="/admin/subscription-management" element={<AdminSubscriptionManagement />} />
            <Route path="/institution" element={<InstitutionDashboard />} />
            <Route path="/institution/learning-materials" element={<InstitutionLearningMaterials />} />
            <Route path="/institution/mock-quizzes" element={<InstitutionMockQuizzes />} />
            <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
            <Route path="/institution/customize-profile" element={<InstitutionDashboard />} />
            <Route path="/institution/profile-management" element={<InstitutionDashboard />} />
            <Route path="/institution/application-review" element={<ApplicationReview />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/scholarships" element={<StudentScholarships />} />
            <Route path="/student/scholarships/:institutionId" element={<StudentScholarships />} />
            <Route path="/student/materials" element={<StudentMaterials />} />
            <Route path="/student/quizzes" element={<StudentQuizzes />} />
            <Route path="/student/quiz-take/:quizId" element={<StudentQuizTake />} />
            <Route path="/student/refer-earn" element={<StudentReferEarn />} />
            <Route path="/student/subscription" element={<StudentSubscription />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </DarkModeProvider>
  </QueryClientProvider>
);

export default App;
