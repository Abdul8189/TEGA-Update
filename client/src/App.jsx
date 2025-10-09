import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./contexts/AuthContext";
import AuthLayout from "./layouts/AuthLayout";
import ScrollToTop from "./components/ScrollToTop.jsx";
import SplashScreen from "./components/SplashScreen";
import { ensureScrollbarsHidden } from "./utils/scrollbarUtils";

// Layout Components
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import AltHeader from "./components/AltHeader.jsx";
import AltFooter from "./components/AltFooter.jsx";
import Alt1Header from "./components/Alt1Header.jsx";
import Alt1Footer from "./components/Alt1Footer.jsx";
import Alt2Header from "./components/Alt2Header.jsx";
import Alt2Footer from "./components/Alt2Footer.jsx";
import Sidebar from "./components/Sidebar.jsx";

// Pages
import HomePage from "./pages/HomePage.jsx";
import AuthCard from "./pages/AuthCard.jsx";
import DashboardPage1 from "./pages/DashboardPage1.jsx";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminCoursePayment from "./pages/AdminCoursePayment.jsx";
import AdminExamResultsPage from "./pages/AdminExamResultsPage.jsx";
import AdminStudentResultDetailPage from "./pages/AdminStudentResultDetailPage.jsx";
import AdminOfferManagement from "./pages/AdminOfferManagement.jsx";
import AdminJobDashboard from "./components/AdminJobDashboard.jsx";

// Principal Pages
import PrincipalDashboard from "./pages/PrincipalDashboard.jsx";
import PrincipalProfile from "./pages/PrincipalProfile.jsx";

// Course & Learning Pages
import CoursePage from "./pages/CoursePage.jsx";
import CourseDashboardPage from "./pages/CourseDashboardPage.jsx";
import UserCoursesPage from "./pages/UserCoursesPage.jsx";
import UdemyStyleCoursePlayer from "./pages/UdemyStyleCoursePlayer.jsx";

// Exam & Assessment Pages
import ExamsPage from "./pages/ExamsPage.jsx";
import ExamConductingPage from "./pages/ExamConductingPage.jsx";
import UserResultsPage from "./pages/UserResultsPage.jsx";
import ExamResultPage from "./pages/ExamResultPage.jsx";
import ResultsPage from "./pages/Result.jsx";
import QuizPage from "./pages/QuizPage.jsx";

// Career Development Pages
import JobsPage from "./pages/JobsPage.jsx";
import InternshipsPage from "./pages/InternshipsPage.jsx";
import JobApplicationPage from "./pages/JobApplicationPage.jsx";
import InternshipApplicationPage from "./pages/InternshipApplicationPage.jsx";
import ResumePage from "./pages/ResumePage.jsx";
import ResumeBuilderPage from "./pages/ResumeBuilderPage.jsx";

// General Pages
import GalleryPage from "./pages/GalleryPage.jsx";
import ContactPage from "./pages/Contact.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import FaqsPage from "./pages/FaqsPage.jsx";
import HelpCenterPage from "./pages/HelpCenterPage.jsx";

// User Account Pages
import Students from "./pages/Students.jsx";
import Principals from "./pages/Principals.jsx";
import Notifications from "./pages/Notifications.jsx";
import History from "./pages/History.jsx";
import EditUser from "./pages/EditUser.jsx";
import ScheduleAssessment from "./pages/ScheduleAssessment.jsx";
import Profile from "./pages/Profile.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";

// Wrapper component to force re-render when courseId changes
const UdemyStyleCoursePlayerWrapper = () => {
  const { courseId } = useParams();
  return <UdemyStyleCoursePlayer key={courseId} />;
};

// ---------------- Layouts ----------------
function DefaultLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 no-padding">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AltHeader />
        <main className="flex-1 overflow-auto hide-scrollbar pt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function PrincipalLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Alt1Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Alt1Footer />
    </div>
  );
}

function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Alt2Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Alt2Footer />
    </div>
  );
}

function UserDashboardLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}

// ---------------- Protected Routes ----------------
const ProtectedRoute = ({ children, roles, redirectTo = "/login" }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log('🔍 ProtectedRoute:', { 
    user: user ? { id: user._id, role: user.role, email: user.email } : null, 
    loading, 
    roles, 
    pathname: location.pathname,
    userRole: user?.role,
    hasUser: !!user,
    userObject: user
  });

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ ProtectedRoute: No user found, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // If user doesn't have required role, redirect to their appropriate dashboard
    const redirectPath =
      user.role === "admin"
        ? "/admin/dashboard"
        : user.role === "principal"
        ? "/principal/dashboard"
        : "/dashboard"; // Default for 'student', 'user', or any other role

    console.log(`❌ ProtectedRoute: User role ${user.role} not authorized for ${roles}. Redirecting to ${redirectPath}`);
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }
  
  console.log('✅ ProtectedRoute: Access granted for role:', user.role);

  return children;
};

// ---------------- App ----------------
export default function App() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  // Debug logging
  console.log('App:', { 
    user: user ? { id: user._id, role: user.role, email: user.email } : null, 
    loading, 
    pathname: location.pathname 
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Ensure scrollbars are hidden
  useEffect(() => {
    const observer = ensureScrollbarsHidden();
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="hide-scrollbar">
      <ScrollToTop />
      <Toaster position="top-center" />
      <Routes>
        {/* Public Website Pages */}
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/courses" element={<CoursePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/result" element={<ResultsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/faqs" element={<FaqsPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/help-center" element={<HelpCenterPage />} />
          <Route path="/support" element={<HelpCenterPage />} />
          <Route path="/certifications" element={<CoursePage showCertifications={true} />} />
          <Route path="/skill-tests" element={<CoursePage showSkillTests={true} />} />
          <Route path="/student-portal" element={<AuthCard redirectTo="/dashboard" />} />
        </Route>

        {/* Auth Pages */}
        <Route element={<AuthLayout />}>
  
  
  
        </Route>

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]} redirectTo="/login">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="principals" element={<Principals />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="offers" element={<AdminOfferManagement />} />
          <Route path="payment-management" element={<AdminCoursePayment />} />
          <Route path="payment" element={<AdminCoursePayment />} />
          <Route path="courses" element={<AdminCoursePayment />} />
          <Route path="course-management" element={<AdminCoursePayment />} />
          <Route path="edit-user/:userId" element={<EditUser />} />
          <Route path="schedule-assessment" element={<ScheduleAssessment />} />
          <Route path="jobs" element={<AdminJobDashboard />} />
          <Route path="exam-results" element={<AdminExamResultsPage />} />
          <Route path="exam-results/:attemptId" element={<AdminStudentResultDetailPage />} />
        </Route>

        {/* Principal Dashboard */}
        <Route
          path="/principal"
          element={
            <ProtectedRoute roles={["principal"]}>
              <PrincipalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PrincipalDashboard />} />
          <Route path="profile" element={<PrincipalProfile />} />
        </Route>

        {/* Auth Page */}
        <Route element={<UserLayout />}>
          <Route path="/auth" element={<AuthCard />} />
          <Route path="/login" element={<AuthCard />} />
          <Route path="/register" element={<AuthCard />} />
        </Route>

        {/* User Dashboard Pages (with Sidebar1) */}
        <Route
          element={
            <ProtectedRoute>
              <UserDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/courses" element={<UserCoursesPage />} />
          <Route path="/dashboard" element={<DashboardPage1 />} />
          {/* Make course-dashboard accessible to any logged-in user (no feature gate) */}
          <Route path="/course-dashboard" element={<CourseDashboardPage />} />
          <Route path="/course/:courseId" element={<UdemyStyleCoursePlayerWrapper />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/apply/:jobId" element={<JobApplicationPage />} />
          <Route path="/internships" element={<InternshipsPage />} />
          <Route path="/internships/apply/:internshipId" element={<InternshipApplicationPage />} />
          <Route path="/exam/:examId" element={<ExamConductingPage />} />
          <Route path="/exam-result/:examId" element={<ExamResultPage />} />
          <Route path="/quiz/:courseId/:moduleIndex" element={<QuizPage />} />
        <Route path="/my-exam-results" element={<UserResultsPage />} />
          <Route path="/resume-builder" element={<ResumeBuilderPage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Catch-all route - handle undefined routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
