import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/format";

const PRIMARY_ITEMS = [
  { icon: "grid-outline", label: "Dashboard", route: "Home" },
  { icon: "restaurant-outline", label: "Cuntada Maalinlaha", route: "Attendance" },
  { icon: "hand-left-outline", label: "Cunto Mar-mar ah", route: "Occasional" },
  { icon: "cash-outline", label: "Lacagaha", route: "Payments" },
];

const buildGroups = (staff) => {
  const isAdmin = staff?.role === "admin";
  const canFinance = isAdmin || staff?.canManageFinance;

  const groups = [
    {
      title: "Ardayda & Waalidiinta",
      items: [
        { icon: "school-outline", label: "Ardayda", route: "Students" },
        { icon: "people-outline", label: "Waalidiinta", route: "Parents" },
      ],
    },
    {
      title: "Maaliyadda",
      items: [
        { icon: "receipt-outline", label: "Invoices", route: "Invoices" },
        { icon: "card-outline", label: "Kharashaadka", route: "Expenses" },
        { icon: "bar-chart-outline", label: "Xisaab-xirka", route: "ProfitLoss" },
        { icon: "alert-circle-outline", label: "Deymaha", route: "OutstandingBalances" },
      ],
    },
    {
      title: "Nidaamka Cuntada",
      items: [
        { icon: "business-outline", label: "Fasallada", route: "Classes" },
        { icon: "fast-food-outline", label: "Meal Plans", route: "MealPlans" },
        { icon: "nutrition-outline", label: "Cuntooyinka", route: "Foods" },
        { icon: "clipboard-outline", label: "Menu-ga", route: "Menu" },
        { icon: "sunny-outline", label: "Fasaxyada", route: "Holidays" },
        { icon: "calendar-outline", label: "Sannadaha", route: "AcademicYears" },
      ],
    },
    {
      title: "Warbixinnada",
      items: [
        { icon: "trending-up-outline", label: "Warbixin Bille", route: "MonthlyReport" },
        { icon: "stats-chart-outline", label: "Warbixin Sannadeed", route: "AnnualReport" },
      ],
    },
  ];

  if (isAdmin) {
    groups.push({
      title: "Maamulka",
      items: [
        { icon: "people-circle-outline", label: "Isticmaalayaasha", route: "Users" },
        { icon: "settings-outline", label: "Settings", route: "Settings" },
        { icon: "document-text-outline", label: "Audit Logs", route: "AuditLogs" },
      ],
    });
  } else if (canFinance) {
    groups.push({ title: "Maamulka", items: [{ icon: "settings-outline", label: "Settings", route: "Settings" }] });
  }

  return groups;
};

const DrawerRow = ({ icon, label, active, onPress }) => (
  <TouchableOpacity style={[styles.row, active && styles.rowActive]} onPress={onPress}>
    <Ionicons name={icon} size={20} color={active ? COLORS.brandDark : COLORS.ink} />
    <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

const StaffDrawerContent = (props) => {
  const { staff, staffLogout } = useAuth();
  const activeRoute = props.state.routes[props.state.index].name;
  const groups = buildGroups(staff);

  const go = (route) => {
    props.navigation.navigate(route);
    props.navigation.closeDrawer();
  };

  return (
    <View style={styles.flex}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(staff?.fullName || "?").trim().charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name} numberOfLines={1}>{staff?.fullName}</Text>
          <Text style={styles.role}>{staff?.role === "admin" ? "Administrator" : "Restaurant Staff"}</Text>
        </View>

        <View style={styles.section}>
          {PRIMARY_ITEMS.map((i) => (
            <DrawerRow key={i.route} icon={i.icon} label={i.label} active={activeRoute === i.route} onPress={() => go(i.route)} />
          ))}
        </View>

        {groups.map((g) => (
          <View key={g.title} style={styles.section}>
            <Text style={styles.groupTitle}>{g.title}</Text>
            {g.items.map((i) => (
              <DrawerRow key={i.route} icon={i.icon} label={i.label} active={activeRoute === i.route} onPress={() => go(i.route)} />
            ))}
          </View>
        ))}
      </DrawerContentScrollView>

      <TouchableOpacity style={styles.logout} onPress={staffLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={styles.logoutText}>Ka Bax</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.surface },
  profile: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.line, flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.brand, alignItems: "center", justifyContent: "center" },
  avatarText: { color: COLORS.ink, fontWeight: "700", fontSize: 18 },
  name: { fontSize: 15, fontWeight: "700", color: COLORS.ink, flexShrink: 1 },
  role: { fontSize: 12, color: "rgba(14,19,24,0.5)", marginTop: 2 },
  section: { paddingHorizontal: 12, paddingTop: 14 },
  groupTitle: { fontSize: 11, fontWeight: "700", color: "rgba(14,19,24,0.4)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, marginLeft: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 11, paddingHorizontal: 10, borderRadius: 12 },
  rowActive: { backgroundColor: "rgba(255,142,40,0.12)" },
  rowLabel: { fontSize: 14, color: COLORS.ink, fontWeight: "500" },
  rowLabelActive: { color: COLORS.brandDark, fontWeight: "700" },
  logout: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 16, paddingHorizontal: 22, borderTopWidth: 1, borderTopColor: COLORS.line },
  logoutText: { fontSize: 14, color: COLORS.danger, fontWeight: "600" },
});

export default StaffDrawerContent;
