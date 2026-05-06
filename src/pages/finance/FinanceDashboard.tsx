import DashboardLayout from "../../components/layout/DashboardLayout";
import { Routes, Route } from "react-router-dom";
import FinanceOverview from "./FinanceOverview";
import FinanceInquiryPage from "./FinanceInquiryPage";

export default function FinanceDashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<FinanceOverview />} />
        <Route path="inquiries" element={<FinanceInquiryPage />} />
      </Routes>
    </DashboardLayout>
  );
}
