import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import staffApi from "../../api/staffClient";
import { useAuth } from "../../context/AuthContext";
import { StaffHeader, Loading } from "../../components/UI";
import { formatMoney, COLORS } from "../../utils/format";

const Stat = ({ label, value, color, icon, badgeColor }) => (
  <View style={styles.stat}>
    <View style={styles.statHead}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={[styles.statBadge, { backgroundColor: badgeColor }]}>
        <Ionicons name={icon} size={15} color="#fff" />
      </View>
    </View>
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

  const expected = data.financial.monthRevenueExpected;
  const collected = data.financial.monthPayments;
  const collectionRate = expected > 0 ? Math.min(100, Math.round((collected / expected) * 100)) : 0;

  return (
    <View style={styles.flex}>
      <StaffHeader title="Dashboard" />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.hero}>
          <View style={styles.heroBlob} />
          <Text style={styles.heroSmall}>Ku Soo Dhawoow,</Text>
          <Text style={styles.heroName}>{staff?.fullName?.split(" ")[0] || "Admin"}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${collectionRate}%` }]} />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.heroSmall}>Collection Rate: {formatMoney(collected)} / {formatMoney(expected)}</Text>
            <Text style={styles.heroPct}>{collectionRate}%</Text>
          </View>
        </View>

        <Text style={styles.groupTitle}>Ardayda</Text>
        <View style={styles.grid}>
          <Stat label="Wadarta" value={data.students.total} icon="people-outline" badgeColor="#2D6CDF" />
          <Stat label="Firfircoon" value={data.students.active} color={COLORS.success} icon="checkmark-circle-outline" badgeColor={COLORS.success} />
          <Stat label="Meal Plan" value={data.students.mealPlanEnrolled} icon="restaurant-outline" badgeColor={COLORS.amber} />
          <Stat label="Mar-mar (30 mln)" value={data.students.occasionalLast30Days} icon="person-outline" badgeColor="#7C3AED" />
        </View>

        <Text style={styles.groupTitle}>Cuntada Maanta</Text>
        <View style={styles.grid}>
          <Stat label="La Filayay" value={data.todayMeals.expected} icon="time-outline" badgeColor="#2D6CDF" />
          <Stat label="Wuu Cunay" value={data.todayMeals.ate} color={COLORS.success} icon="checkmark-circle-outline" badgeColor={COLORS.success} />
          <Stat label="Ma Cunin" value={data.todayMeals.didNotEat} color={COLORS.danger} icon="close-circle-outline" badgeColor={COLORS.danger} />
          <Stat label="Boqolkiiba" value={`${data.todayMeals.attendancePercentage}%`} icon="stats-chart-outline" badgeColor="#7C3AED" />
        </View>

        <Text style={styles.groupTitle}>Maaliyadda</Text>
        <View style={styles.grid}>
          <Stat label="Maanta" value={formatMoney(data.financial.todaysPayments)} color={COLORS.success} icon="cash-outline" badgeColor={COLORS.success} />
          <Stat label="Bishaan" value={formatMoney(data.financial.monthPayments)} color={COLORS.success} icon="wallet-outline" badgeColor={COLORS.success} />
          <Stat label="La Sugayo" value={formatMoney(data.financial.outstanding)} color={COLORS.danger} icon="alert-circle-outline" badgeColor={COLORS.danger} />
          <Stat label="Waalid Aan Bixin" value={data.financial.unpaidParents} color={COLORS.danger} icon="people-outline" badgeColor={COLORS.danger} />
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
  hero: { backgroundColor: COLORS.navy, borderRadius: 18, padding: 18, marginBottom: 16, overflow: "hidden" },
  heroBlob: { position: "absolute", top: -50, right: -50, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.06)" },
  heroSmall: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 4 },
  heroName: { color: "#fff", fontSize: 24, fontWeight: "700", marginBottom: 14 },
  progressTrack: { height: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: 6, backgroundColor: COLORS.success, borderRadius: 999 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  heroPct: { color: "#fff", fontSize: 13, fontWeight: "700" },
  groupTitle: { fontSize: 12, color: "rgba(36,19,23,0.5)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 8 },
  stat: {
    width: "48.5%",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  statHead: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  statBadge: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  statLabel: { fontSize: 10, color: "rgba(36,19,23,0.5)", textTransform: "uppercase", letterSpacing: 0.5, flex: 1, marginRight: 6 },
  statValue: { fontSize: 18, fontWeight: "700", color: COLORS.ink, marginTop: 10 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.line },
  menuLine: { fontSize: 13, color: COLORS.ink, marginBottom: 4, textTransform: "capitalize" },
});

export default StaffDashboardScreen;
