import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { StaffHeader } from "../../components/UI";
import { COLORS } from "../../utils/format";

const GROUPS = [
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
    ],
  },
];

const StaffMoreScreen = ({ navigation }) => (
  <View style={styles.flex}>
    <StaffHeader title="Dheeri" />
    <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
      {GROUPS.map((g) => (
        <View key={g.title} style={{ marginBottom: 14 }}>
          <Text style={styles.group}>{g.title}</Text>
          <View style={styles.card}>
            {g.items.map((i, idx) => (
              <TouchableOpacity key={i.route} style={[styles.row, idx > 0 && styles.rowBorder]} onPress={() => navigation.navigate(i.route)}>
                <Text style={styles.icon}>{i.icon}</Text>
                <Text style={styles.label}>{i.label}</Text>
                <Text style={styles.chev}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  group: { fontSize: 12, color: "rgba(20,24,33,0.5)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, marginLeft: 4 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: COLORS.line },
  icon: { fontSize: 18, width: 30 },
  label: { flex: 1, fontSize: 15, color: COLORS.ink },
  chev: { fontSize: 20, color: "rgba(20,24,33,0.3)" },
});

export default StaffMoreScreen;
