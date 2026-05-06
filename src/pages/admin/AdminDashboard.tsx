import DashboardLayout from "../../components/layout/DashboardLayout";
import { Routes, Route } from "react-router-dom";
import AdminOverview from "./AdminOverview";
import UsersPage from "./UsersPage";
import ClassesPage from "./ClassesPage";
import SubjectsPage from "./SubjectsPage";
import AcademicYearsPage from "./AcademicYearsPage";
import AdminSchedulePage from "./AdminSchedulePage";
import AdminStudentManagementPage from "./AdminStudentManagementPage";
import AdminWorkloadPage from "./AdminWorkloadPage";
import BulletinEditorPage from "./BulletinEditorPage";
import CalendarAdminPage from "./CalendarAdminPage";

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="academic-years" element={<AcademicYearsPage />} />
        <Route path="schedules" element={<AdminSchedulePage />} />
        <Route path="students" element={<AdminStudentManagementPage />} />
        <Route path="workload" element={<AdminWorkloadPage />} />
        <Route path="bulletins" element={<BulletinEditorPage />} />
        <Route path="calendar" element={<CalendarAdminPage />} />
      </Routes>
    </DashboardLayout>
  );
}