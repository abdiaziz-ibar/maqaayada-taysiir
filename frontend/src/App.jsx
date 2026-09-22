import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ParentProtectedRoute from "./components/ParentProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import ParentPortalDashboard from "./pages/portal/ParentPortalDashboard";
import ParentPortalChildMeals from "./pages/portal/ParentPortalChildMeals";
import ParentPortalPayments from "./pages/portal/ParentPortalPayments";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import Parents from "./pages/Parents";
import ParentDetail from "./pages/ParentDetail";
import Classes from "./pages/Classes";
import MealPlans from "./pages/MealPlans";
import AcademicYears from "./pages/AcademicYears";
import Holidays from "./pages/Holidays";
import Foods from "./pages/Foods";
import Menu from "./pages/Menu";
import Attendance from "./pages/Attendance";
import OccasionalMeals from "./pages/OccasionalMeals";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import PaymentNew from "./pages/PaymentNew";
import Receipt from "./pages/Receipt";
import OutstandingBalances from "./pages/OutstandingBalances";
import MonthlyPaymentReport from "./pages/reports/MonthlyPaymentReport";
import AnnualReport from "./pages/reports/AnnualReport";
import Users from "./pages/Users";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";
import CalendarPage from "./pages/Calendar";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ParentProtectedRoute />}>
        <Route path="/portal/dashboard" element={<ParentPortalDashboard />} />
        <Route path="/portal/students/:id/meals" element={<ParentPortalChildMeals />} />
        <Route path="/portal/payments" element={<ParentPortalPayments />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/parents" element={<Parents />} />
          <Route path="/parents/:id" element={<ParentDetail />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/meal-plans" element={<MealPlans />} />
          <Route path="/academic-years" element={<AcademicYears />} />
          <Route path="/calendar" element={<CalendarPage />} />

          <Route path="/attendance" element={<Attendance />} />
          <Route path="/occasional-meals" element={<OccasionalMeals />} />
          <Route path="/foods" element={<Foods />} />
          <Route path="/menu" element={<Menu />} />

          <Route path="/invoices" element={<Invoices />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/payments/new" element={<PaymentNew />} />
          <Route path="/payments/:id/receipt" element={<Receipt />} />
          <Route path="/outstanding-balances" element={<OutstandingBalances />} />

          <Route path="/reports/monthly" element={<MonthlyPaymentReport />} />
          <Route path="/reports/annual" element={<AnnualReport />} />

          <Route path="/users" element={<Users />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/holidays" element={<Holidays />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
