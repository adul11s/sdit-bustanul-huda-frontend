/// <reference types="vite/client" />
import React, { useEffect, useState, type ReactNode } from "react";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import { LandingPage } from "./landing/pages/LandingPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherSchedulePage from "./pages/teacher/TeacherSchedulePage";
import TeacherAttendancePage from "./pages/teacher/TeacherAttendancePage";
import TeacherGradePage from "./pages/teacher/TeacherGradePage";
import TeacherExamCreatePage from "./pages/teacher/TeacherExamCreatePage";
import TeacherAssignmentCreatePage from "./pages/teacher/TeacherAssignmentCreatePage";
import HomeroomDashboard from "./pages/homeroom/HomeroomDashboard";
import HomeroomAttendancePage from "./pages/homeroom/HomeroomAttendancePage";
import HomeroomAttendanceMonthlyPage from "./pages/homeroom/HomeroomAttendanceMonthlyPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfilePage from "./pages/student/StudentProfilePage";
import StudentExamsPage from "./pages/student/StudentExamsPage";
import StudentExamPage from "./pages/student/StudentExamPage";
import StudentAssignmentsPage from "./pages/student/StudentAssignmentsPage";
import StudentAssignmentPage from "./pages/student/StudentAssignmentPage";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import CalendarPage from "./pages/CalendarPage";
import ProfilePage from "./pages/ProfilePage";
import LoadingScreen from "./components/LoadingScreen";
import { Toaster } from "../components/ui/sonner";

function FetchPolyfill({ children }: { children: ReactNode }) {
  useEffect(() => {
    const originalFetch = window.fetch;
    const API_URL = import.meta.env.VITE_API_URL;
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      init = init || {};
      if (typeof input === 'string' && input.startsWith('/api')) {
        init.credentials = 'include';
        if (API_URL) {
          input = API_URL + input;
        }
      }
      return originalFetch.call(window, input, init);
    };
    return () => { window.fetch = originalFetch; };
  }, []);
  return <>{children}</>;
}

function ProtectedRoute({ children, role }: { children: ReactNode, role?: string }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen message="Memuat sesi..." />;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) {
    if (user.role === "HOMEROOM_TEACHER" && role === "TEACHER") return <>{children}</>;
    if (user.role === "ADMIN" && role === "FINANCE") return <>{children}</>;
    return <Navigate to="/" />;
  }
  return <>{children}</>;
}

function RoleRoutes() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  const routes: Record<string, string> = {
    ADMIN: "/admin",
    TEACHER: "/teacher",
    HOMEROOM_TEACHER: "/homeroom",
    STUDENT: "/student",
    FINANCE: "/finance",
  };
  return <Navigate to={routes[user.role] || "/login"} />;
}

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAppReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!appReady) {
    return <LoadingScreen message="Bismillah ..." />;
  }

  return (
    <AuthProvider>
      <FetchPolyfill>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/*" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/teacher/schedule" element={<ProtectedRoute role="TEACHER"><TeacherSchedulePage /></ProtectedRoute>} />
            <Route path="/teacher/attendance" element={<ProtectedRoute role="TEACHER"><TeacherAttendancePage /></ProtectedRoute>} />
            <Route path="/teacher/grades" element={<ProtectedRoute role="TEACHER"><TeacherGradePage /></ProtectedRoute>} />
            <Route path="/teacher/exams/create" element={<ProtectedRoute role="TEACHER"><TeacherExamCreatePage /></ProtectedRoute>} />
            <Route path="/teacher/assignments/create" element={<ProtectedRoute role="TEACHER"><TeacherAssignmentCreatePage /></ProtectedRoute>} />
            <Route path="/teacher/*" element={<ProtectedRoute role="TEACHER"><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/homeroom/attendance" element={<ProtectedRoute role="HOMEROOM_TEACHER"><HomeroomAttendancePage /></ProtectedRoute>} />
            <Route path="/homeroom/attendance/monthly" element={<ProtectedRoute role="HOMEROOM_TEACHER"><HomeroomAttendanceMonthlyPage /></ProtectedRoute>} />
            <Route path="/homeroom/*" element={<ProtectedRoute role="HOMEROOM_TEACHER"><HomeroomDashboard /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute role="STUDENT"><StudentProfilePage /></ProtectedRoute>} />
            <Route path="/student/exams" element={<ProtectedRoute role="STUDENT"><StudentExamsPage /></ProtectedRoute>} />
            <Route path="/student/exams/:examId" element={<ProtectedRoute role="STUDENT"><StudentExamPage /></ProtectedRoute>} />
            <Route path="/student/assignments" element={<ProtectedRoute role="STUDENT"><StudentAssignmentsPage /></ProtectedRoute>} />
            <Route path="/student/assignments/:assignmentId" element={<ProtectedRoute role="STUDENT"><StudentAssignmentPage /></ProtectedRoute>} />
            <Route path="/student/*" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/finance/*" element={<ProtectedRoute role="FINANCE"><FinanceDashboard /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<RoleRoutes />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </FetchPolyfill>
    </AuthProvider>
  );
}