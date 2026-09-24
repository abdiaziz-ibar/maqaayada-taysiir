import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ParentDashboardScreen from "../screens/ParentDashboardScreen";
import ParentChildMealsScreen from "../screens/ParentChildMealsScreen";
import ParentPaymentsScreen from "../screens/ParentPaymentsScreen";

const Stack = createNativeStackNavigator();

const ParentNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
    <Stack.Screen name="ChildMeals" component={ParentChildMealsScreen} />
    <Stack.Screen name="ParentPayments" component={ParentPaymentsScreen} />
  </Stack.Navigator>
);

export default ParentNavigator;
