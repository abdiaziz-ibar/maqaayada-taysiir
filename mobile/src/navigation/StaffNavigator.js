import { createDrawerNavigator } from "@react-navigation/drawer";
import StaffDrawerContent from "../components/StaffDrawerContent";
import StaffDashboardScreen from "../screens/staff/StaffDashboardScreen";
import StaffAttendanceScreen from "../screens/staff/StaffAttendanceScreen";
import StaffOccasionalMealsScreen from "../screens/staff/StaffOccasionalMealsScreen";
import StaffPaymentsScreen from "../screens/staff/StaffPaymentsScreen";
import StaffPaymentNewScreen from "../screens/staff/StaffPaymentNewScreen";
import StaffStudentsScreen from "../screens/staff/StaffStudentsScreen";
import StaffStudentDetailScreen from "../screens/staff/StaffStudentDetailScreen";
import StaffParentsScreen from "../screens/staff/StaffParentsScreen";
import StaffParentDetailScreen from "../screens/staff/StaffParentDetailScreen";
import StaffInvoicesScreen from "../screens/staff/StaffInvoicesScreen";
import StaffExpensesScreen from "../screens/staff/StaffExpensesScreen";
import StaffProfitLossScreen from "../screens/staff/StaffProfitLossScreen";
import StaffClassesScreen from "../screens/staff/StaffClassesScreen";
import StaffMealPlansScreen from "../screens/staff/StaffMealPlansScreen";
import StaffFoodsScreen from "../screens/staff/StaffFoodsScreen";
import StaffMenuScreen from "../screens/staff/StaffMenuScreen";
import StaffHolidaysScreen from "../screens/staff/StaffHolidaysScreen";
import StaffAcademicYearsScreen from "../screens/staff/StaffAcademicYearsScreen";
import StaffUsersScreen from "../screens/staff/StaffUsersScreen";
import StaffSettingsScreen from "../screens/staff/StaffSettingsScreen";
import StaffAuditLogsScreen from "../screens/staff/StaffAuditLogsScreen";
import StaffOutstandingBalancesScreen from "../screens/staff/StaffOutstandingBalancesScreen";
import StaffMonthlyReportScreen from "../screens/staff/StaffMonthlyReportScreen";
import StaffAnnualReportScreen from "../screens/staff/StaffAnnualReportScreen";

const Drawer = createDrawerNavigator();

const StaffNavigator = () => (
  <Drawer.Navigator
    initialRouteName="Home"
    screenOptions={{ headerShown: false, drawerType: "front", overlayColor: "rgba(14,19,24,0.4)" }}
    drawerContent={(props) => <StaffDrawerContent {...props} />}
  >
    <Drawer.Screen name="Home" component={StaffDashboardScreen} />
    <Drawer.Screen name="Attendance" component={StaffAttendanceScreen} />
    <Drawer.Screen name="Occasional" component={StaffOccasionalMealsScreen} />
    <Drawer.Screen name="Payments" component={StaffPaymentsScreen} />
    <Drawer.Screen name="PaymentNew" component={StaffPaymentNewScreen} />
    <Drawer.Screen name="Students" component={StaffStudentsScreen} />
    <Drawer.Screen name="StudentDetail" component={StaffStudentDetailScreen} />
    <Drawer.Screen name="Parents" component={StaffParentsScreen} />
    <Drawer.Screen name="ParentDetail" component={StaffParentDetailScreen} />
    <Drawer.Screen name="Invoices" component={StaffInvoicesScreen} />
    <Drawer.Screen name="Expenses" component={StaffExpensesScreen} />
    <Drawer.Screen name="ProfitLoss" component={StaffProfitLossScreen} />
    <Drawer.Screen name="Classes" component={StaffClassesScreen} />
    <Drawer.Screen name="MealPlans" component={StaffMealPlansScreen} />
    <Drawer.Screen name="Foods" component={StaffFoodsScreen} />
    <Drawer.Screen name="Menu" component={StaffMenuScreen} />
    <Drawer.Screen name="Holidays" component={StaffHolidaysScreen} />
    <Drawer.Screen name="AcademicYears" component={StaffAcademicYearsScreen} />
    <Drawer.Screen name="Users" component={StaffUsersScreen} />
    <Drawer.Screen name="Settings" component={StaffSettingsScreen} />
    <Drawer.Screen name="AuditLogs" component={StaffAuditLogsScreen} />
    <Drawer.Screen name="OutstandingBalances" component={StaffOutstandingBalancesScreen} />
    <Drawer.Screen name="MonthlyReport" component={StaffMonthlyReportScreen} />
    <Drawer.Screen name="AnnualReport" component={StaffAnnualReportScreen} />
  </Drawer.Navigator>
);

export default StaffNavigator;
