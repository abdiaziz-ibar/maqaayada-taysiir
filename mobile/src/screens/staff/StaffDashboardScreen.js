import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import staffApi from "../../api/staffClient";
import { useAuth } from "../../context/AuthContext";
import { StaffHeader, Loading } from "../../components/UI";
import { formatMoney, COLORS } from "../../utils/format";

const Stat = ({ label, value, color }) => (
  <View style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, color && { color }]}>{value}</Text>
  </View>
);

const StaffDashboardScreen = () => {
  const { staff } = useAuth();
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await staffApi.get("/dashboard");
    setData(res.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!data) return <Loading />;

  return (
    <View style={styles.flex}>
      <StaffHeader title="Dashboard" />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.hero}>
          <Text style={styles.heroSmall}>Ku Soo Dhawoow,</Text>
          <Text style={styles.heroName}>{staff?.fullName?.split(" ")[0] || "Admin"}</Text>
          <Text style={styles.heroSmall}>
            Cuntada Maanta: {data.todayMeals.ate}/{data.todayMeals.expected} ({data.todayMeals.attendancePercentage}%)
          </Text>
        </View>

        <Text style={styles.groupTitle}>Ardayda</Text>
        <View style={styles.grid}>
          <Stat label="Wadarta" value={data.students.total} />
          <Stat label="Firfircoon" value={data.students.active} color={COLORS.success} />
          <Stat label="Meal Plan" value={data.students.mealPlanEnrolled} />
          <Stat label="Mar-mar (30 mln)" value={data.students.occasionalLast30Days} />
        </View>

        <Text style={styles.groupTitle}>Maaliyadda</Text>
        <View style={styles.grid}>
          <Stat label="Maanta" value={formatMoney(data.financial.todaysPayments)} color={COLORS.success} />
          <Stat label="Bishaan" value={formatMoney(data.financial.monthPayments)} color={COLORS.success} />
          <Stat label="La Sugayo" value={formatMoney(data.financial.outstanding)} color={COLORS.danger} />
          <Stat label="Waalid Aan Bixin" value={data.financial.unpaidParents} color={COLORS.danger} />
        </View>

        {data.restaurant.todayMenus.length > 0 && (
          <>
            <Text style={styles.groupTitle}>Menu-ga Maanta</Text>
            <View style={styles.card}>
              {data.restaurant.todayMenus.map((m) => (
                <Text key={m.mealType} style={styles.menuLine}>
                  <Text style={{ fontWeight: "700" }}>{m.mealType}: </Text>
                  {m.foods.join(", ") || "-"}
                </Text>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  content: { padding: 14, paddingBottom: 40 },
  hero: { backgroundColor: COLORS.navy, borderRadius: 14, padding: 18, marginBottom: 14 },
  heroSmall: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 4 },
  heroName: { color: "#fff", fontSize: 24, fontWeight: "700", marginBottom: 4 },
  groupTitle: { fontSize: 12, color: "rgba(20,24,33,0.5)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 8 },
  stat: {
    width: "48.5%",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  statLabel: { fontSize: 10, color: "rgba(20,24,33,0.5)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: "700", color: COLORS.ink },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.line },
  menuLine: { fontSize: 13, color: COLORS.ink, marginBottom: 4, textTransform: "capitalize" },
});

export default StaffDashboardScreen;
