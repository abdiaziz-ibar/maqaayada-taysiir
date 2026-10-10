import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StaffHeader } from "../../components/UI";
import { COLORS, TILE_COLORS } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

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
      ],
    });
  } else if (canFinance) {
    groups.push({ title: "Maamulka", items: [{ icon: "settings-outline", label: "Settings", route: "Settings" }] });
  }

  return groups;
};

const StaffMoreScreen = ({ navigation }) => {
  const { staff } = useAuth();
  const groups = buildGroups(staff);
  let tileIndex = 0;

  return (
    <View style={styles.flex}>
      <StaffHeader title="Dheeri" />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
        {groups.map((g) => (
          <View key={g.title} style={{ marginBottom: 20 }}>
            <Text style={styles.group}>{g.title}</Text>
            <View style={styles.grid}>
              {g.items.map((i) => {
                const palette = TILE_COLORS[tileIndex % TILE_COLORS.length];
                tileIndex += 1;
                return (
                  <TouchableOpacity key={i.route} style={styles.tile} onPress={() => navigation.navigate(i.route)}>
                    <View style={[styles.iconBox, { backgroundColor: palette.bg }]}>
                      <Ionicons name={i.icon} size={22} color={palette.fg} />
                    </View>
                    <Text style={styles.tileLabel} numberOfLines={2}>{i.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  group: { fontSize: 13, fontWeight: "700", color: COLORS.ink, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  tile: { width: "22%", alignItems: "center" },
  iconBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  tileLabel: { fontSize: 11, color: COLORS.ink, textAlign: "center", fontWeight: "500" },
});

export default StaffMoreScreen;
