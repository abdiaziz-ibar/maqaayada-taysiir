import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import Svg, { Circle } from "react-native-svg";
import staffApi from "../../api/staffClient";
import { useAuth } from "../../context/AuthContext";
import { StaffHeader, Loading } from "../../components/UI";
import { formatMoney, monthLabel, COLORS } from "../../utils/format";

const RING_SIZE = 72;
const RING_STROKE = 7;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const ProgressRing = ({ percent }) => (
  <View style={{ width: RING_SIZE, height: RING_SIZE }}>
    <Svg width={RING_SIZE} height={RING_SIZE}>
      <Circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth={RING_STROKE}
        fill="none"
      />
      <Circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        stroke="#fff"
        strokeWidth={RING_STROKE}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={RING_CIRCUMFERENCE * (1 - percent / 100)}
        rotation="-90"
        origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
      />
    </Svg>
    <View style={StyleSheet.absoluteFillObject}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={styles.ringText}>{percent}%</Text>
      </View>
    </View>
  </View>
);

const StatCard = ({ icon, label, value, badgeColor }) => (
  <View style={styles.stat}>
    <View style={styles.statTop}>
      <View style={[styles.statBadge, { backgroundColor: badgeColor }]}>
        <Text style={{ fontSize: 14 }}>{icon}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const StatusCount = ({ value, label, color }) => (
  <View style={{ alignItems: "center", flex: 1 }}>
    <Text style={[styles.statusValue, { color }]}>{value}</Text>
    <Text style={styles.statusLabel}>{label}</Text>
  </View>
);

const StaffDashboardScreen = () => {
  const { staff } = useAuth();
  const [data, setData] = useState(null);
  const [months, setMonths] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [dash, annual] = await Promise.all([
      staffApi.get("/dashboard"),
      staffApi.get("/reports/annual").catch(() => null),
    ]);
    setData(dash.data);
    setMonths(annual?.data?.months || []);
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
  const maxMonthPaid = Math.max(1, ...months.map((m) => m.totalPaid));
  const statusCounts = data.financial.invoiceStatusCounts;

  return (
    <View style={styles.flex}>
      <StaffHeader title="Dashboard" />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.hero}>
          <View style={styles.heroBlob} />
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroSmall}>Ku Soo Dhawoow,</Text>
              <Text style={styles.heroName}>{staff?.fullName?.split(" ")[0] || "Admin"}</Text>
            </View>
            <ProgressRing percent={collectionRate} />
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${collectionRate}%` }]} />
          </View>
          <Text style={styles.heroSmall}>Collection Rate: {formatMoney(collected)} / {formatMoney(expected)}</Text>
        </View>

        <View style={styles.grid}>
          <StatCard icon="👨‍👩‍👧" label="Waalidiinta" value={data.financial.parentsCount} badgeColor="#2D6CDF" />
          <StatCard icon="💰" label="Wadarta Lacagta" value={formatMoney(expected)} badgeColor="#7C3AED" />
          <StatCard icon="✅" label="La Bixiyey" value={formatMoney(collected)} badgeColor={COLORS.success} />
          <StatCard icon="⚠️" label="Deynta" value={formatMoney(data.financial.outstanding)} badgeColor={COLORS.danger} />
        </View>

        <View style={styles.statusRow}>
          <StatusCount value={statusCounts.paid} label="La Bixiyey" color={COLORS.success} />
          <View style={styles.statusDivider} />
          <StatusCount value={statusCounts.partial} label="Qayb Ahaan" color={COLORS.amber} />
          <View style={styles.statusDivider} />
          <StatusCount value={statusCounts.unpaid} label="Lama Bixin" color={COLORS.danger} />
        </View>

        <Text style={styles.groupTitle}>Ardayda</Text>
        <View style={styles.grid}>
          <StatCard icon="🎓" label="Wadarta Ardayda" value={data.students.total} badgeColor="#2D6CDF" />
          <StatCard icon="✅" label="Firfircoon" value={data.students.active} badgeColor={COLORS.success} />
          <StatCard icon="🍱" label="Meal Plan" value={data.students.mealPlanEnrolled} badgeColor={COLORS.amber} />
          <StatCard icon="🙋" label="Mar-mar (30 mln)" value={data.students.occasionalLast30Days} badgeColor="#7C3AED" />
        </View>

        {months.length > 0 && (
          <>
            <Text style={styles.groupTitle}>Lacagta Bil Kasta</Text>
            <View style={styles.card}>
              {months.map((m) => (
                <View key={`${m.year}-${m.month}`} style={styles.barRow}>
                  <Text style={styles.barLabel}>{monthLabel(m.month)}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${Math.max(4, (m.totalPaid / maxMonthPaid) * 100)}%` }]} />
                  </View>
                  <Text style={styles.barValue}>{formatMoney(m.totalPaid)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.groupTitle}>Cuntada Maanta</Text>
        <View style={styles.grid}>
          <StatCard icon="⏱️" label="La Filayay" value={data.todayMeals.expected} badgeColor="#2D6CDF" />
          <StatCard icon="✅" label="Wuu Cunay" value={data.todayMeals.ate} badgeColor={COLORS.success} />
          <StatCard icon="❌" label="Ma Cunin" value={data.todayMeals.didNotEat} badgeColor={COLORS.danger} />
          <StatCard icon="📈" label="Boqolkiiba" value={`${data.todayMeals.attendancePercentage}%`} badgeColor="#7C3AED" />
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
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  heroSmall: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 4 },
  heroName: { color: "#fff", fontSize: 22, fontWeight: "700" },
  ringText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  progressTrack: { height: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 999, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: 6, backgroundColor: "#fff", borderRadius: 999 },
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
  statTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  statBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  statLabel: { fontSize: 11, color: "rgba(36,19,23,0.55)", flexShrink: 1 },
  statValue: { fontSize: 17, fontWeight: "700", color: COLORS.ink },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingVertical: 16,
    marginBottom: 16,
  },
  statusDivider: { width: 1, height: 32, backgroundColor: COLORS.line },
  statusValue: { fontSize: 20, fontWeight: "700" },
  statusLabel: { fontSize: 11, color: "rgba(36,19,23,0.5)", marginTop: 2 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.line },
  menuLine: { fontSize: 13, color: COLORS.ink, marginBottom: 4, textTransform: "capitalize" },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  barLabel: { width: 64, fontSize: 12, color: "rgba(36,19,23,0.6)" },
  barTrack: { flex: 1, height: 10, backgroundColor: COLORS.paper, borderRadius: 999, overflow: "hidden", marginHorizontal: 8 },
  barFill: { height: 10, backgroundColor: COLORS.brand, borderRadius: 999 },
  barValue: { width: 60, fontSize: 12, color: COLORS.ink, fontWeight: "600", textAlign: "right" },
});

export default StaffDashboardScreen;
