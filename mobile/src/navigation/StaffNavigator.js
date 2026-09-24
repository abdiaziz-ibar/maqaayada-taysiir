import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StaffDashboardScreen from "../screens/staff/StaffDashboardScreen";
import StaffAttendanceScreen from "../screens/staff/StaffAttendanceScreen";
import StaffOccasionalMealsScreen from "../screens/staff/StaffOccasionalMealsScreen";
import StaffPaymentsScreen from "../screens/staff/StaffPaymentsScreen";
import StaffMoreScreen from "../screens/staff/StaffMoreScreen";
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
import { COLORS } from "../utils/format";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabIcon = (emoji) => ({ focused }) => <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>;

const Tabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: COLORS.brand,
      tabBarInactiveTintColor: "rgba(20,24,33,0.5)",
      tabBarLabelStyle: { fontSize: 11 },
    }}
  >
    <Tab.Screen name="Home" component={StaffDashboardScreen} options={{ title: "Dashboard", tabBarIcon: tabIcon("📊") }} />
    <Tab.Screen name="Attendance" component={StaffAttendanceScreen} options={{ title: "Cuntada", tabBarIcon: tabIcon("🍽️") }} />
    <Tab.Screen name="Occasional" component={StaffOccasionalMealsScreen} options={{ title: "Mar-mar", tabBarIcon: tabIcon("🙋") }} />
    <Tab.Screen name="Payments" component={StaffPaymentsScreen} options={{ title: "Lacagaha", tabBarIcon: tabIcon("💵") }} />
    <Tab.Screen name="More" component={StaffMoreScreen} options={{ title: "Dheeri", tabBarIcon: tabIcon("☰") }} />
  </Tab.Navigator>
);

const StaffNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={Tabs} />
    <Stack.Screen name="PaymentNew" component={StaffPaymentNewScreen} />
    <Stack.Screen name="Students" component={StaffStudentsScreen} />
    <Stack.Screen name="StudentDetail" component={StaffStudentDetailScreen} />
    <Stack.Screen name="Parents" component={StaffParentsScreen} />
    <Stack.Screen name="ParentDetail" component={StaffParentDetailScreen} />
    <Stack.Screen name="Invoices" component={StaffInvoicesScreen} />
    <Stack.Screen name="Expenses" component={StaffExpensesScreen} />
    <Stack.Screen name="ProfitLoss" component={StaffProfitLossScreen} />
    <Stack.Screen name="Classes" component={StaffClassesScreen} />
    <Stack.Screen name="MealPlans" component={StaffMealPlansScreen} />
    <Stack.Screen name="Foods" component={StaffFoodsScreen} />
    <Stack.Screen name="Menu" component={StaffMenuScreen} />
    <Stack.Screen name="Holidays" component={StaffHolidaysScreen} />
    <Stack.Screen name="AcademicYears" component={StaffAcademicYearsScreen} />
    <Stack.Screen name="Users" component={StaffUsersScreen} />
    <Stack.Screen name="Settings" component={StaffSettingsScreen} />
    <Stack.Screen name="AuditLogs" component={StaffAuditLogsScreen} />
    <Stack.Screen name="OutstandingBalances" component={StaffOutstandingBalancesScreen} />
    <Stack.Screen name="MonthlyReport" component={StaffMonthlyReportScreen} />
    <Stack.Screen name="AnnualReport" component={StaffAnnualReportScreen} />
  </Stack.Navigator>
);

export default StaffNavigator;
