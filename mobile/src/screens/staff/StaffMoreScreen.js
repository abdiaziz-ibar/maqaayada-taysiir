import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
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
        { icon: "🎓", label: "Ardayda", route: "Students" },
        { icon: "👥", label: "Waalidiinta", route: "Parents" },
      ],
    },
    {
      title: "Maaliyadda",
      items: [
        { icon: "🧾", label: "Invoices", route: "Invoices" },
        { icon: "💳", label: "Kharashaadka", route: "Expenses" },
        { icon: "📊", label: "Xisaab-xirka", route: "ProfitLoss" },
        { icon: "⚠️", label: "Deymaha", route: "OutstandingBalances" },
      ],
    },
    {
      title: "Nidaamka Cuntada",
      items: [
        { icon: "🏫", label: "Fasallada", route: "Classes" },
        { icon: "🍱", label: "Meal Plans", route: "MealPlans" },
        { icon: "🥗", label: "Cuntooyinka", route: "Foods" },
        { icon: "📋", label: "Menu-ga", route: "Menu" },
        { icon: "🏖️", label: "Fasaxyada", route: "Holidays" },
        { icon: "📅", label: "Sannadaha", route: "AcademicYears" },
      ],
    },
    {
      title: "Warbixinnada",
      items: [
        { icon: "📈", label: "Warbixin Bille", route: "MonthlyReport" },
        { icon: "📆", label: "Warbixin Sannadeed", route: "AnnualReport" },
      ],
    },
  ];

  if (isAdmin) {
    groups.push({
      title: "Maamulka",
      items: [
        { icon: "🧑‍💼", label: "Isticmaalayaasha", route: "Users" },
        { icon: "⚙️", label: "Settings", route: "Settings" },
        { icon: "📜", label: "Audit Logs", route: "AuditLogs" },
      ],
    });
  } else if (canFinance) {
    groups.push({
      title: "Maamulka",
      items: [{ icon: "⚙️", label: "Settings", route: "Settings" }],
    });
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
                      <Text style={styles.iconText}>{i.icon}</Text>
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
  iconText: { fontSize: 24 },
  tileLabel: { fontSize: 11, color: COLORS.ink, textAlign: "center", fontWeight: "500" },
});

export default StaffMoreScreen;
