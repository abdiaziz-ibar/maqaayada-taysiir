import { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Loading, Badge } from "../components/UI";
import { formatMoney, monthLabel, invoiceStatusLabel, invoiceStatusColor, COLORS } from "../utils/format";
import ParentChangePasswordModal from "../components/ParentChangePasswordModal";

const ParentDashboardScreen = ({ navigation }) => {
  const { parent, logout } = useAuth();
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get("/parent-portal/me");
    setData(res.data);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!data) return <Loading />;
  const { students, totalOwed } = data;

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Maqaayda Taysiir</Text>
          <Text style={styles.headerSub}>{parent?.fullName}</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setShowPassword(true)}>
          <Text style={styles.headerBtnText}>Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn} onPress={logout}>
          <Text style={styles.headerBtnText}>Ka Bax</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Ardayda</Text>
            <Text style={styles.statValue}>{students.length}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>La Sugayo</Text>
            <Text style={[styles.statValue, { color: COLORS.danger }]}>{formatMoney(totalOwed)}</Text>
          </View>
        </View>

        {students.map((s) => {
          const owed = s.invoices.reduce((sum, i) => sum + (i.amountDue - i.amountPaid), 0);
          return (
            <View key={s.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.childName}>{s.fullName}</Text>
                  <Text style={styles.childMeta}>{s.studentCode} {s.class ? `· ${s.class.name}` : ""}</Text>
                </View>
                <TouchableOpacity style={styles.mealsBtn} onPress={() => navigation.navigate("ChildMeals", { id: s.id, name: s.fullName })}>
                  <Text style={styles.mealsBtnText}>🍽️ Cuntadiisa</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.owedLine}>Ku Dhiman: <Text style={{ color: owed > 0 ? COLORS.danger : COLORS.success, fontWeight: "700" }}>{formatMoney(owed)}</Text></Text>
              {s.invoices.map((inv) => (
                <View key={inv.id} style={styles.invRow}>
                  <Text style={styles.invMonth}>{monthLabel(inv.month)} {inv.year}</Text>
                  <Text style={styles.invAmount}>{formatMoney(inv.amountDue)} / {formatMoney(inv.amountPaid)}</Text>
                  <Badge text={invoiceStatusLabel(inv.status)} color={invoiceStatusColor(inv.status)} />
                </View>
              ))}
              {s.invoices.length === 0 && <Text style={styles.noInvoice}>Weli invoice lama dhigin.</Text>}
            </View>
          );
        })}
        {students.length === 0 && <Text style={styles.empty}>Weli arday lagula xidhiidhin xisaabtaan.</Text>}

        <TouchableOpacity style={styles.paymentsLink} onPress={() => navigation.navigate("ParentPayments")}>
          <Text style={styles.paymentsLinkText}>Taariikhda Lacag Bixinta ›</Text>
        </TouchableOpacity>
      </ScrollView>

      <ParentChangePasswordModal visible={showPassword} onClose={() => setShowPassword(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  header: { backgroundColor: COLORS.navyDark, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 2 },
  headerBtn: { borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  headerBtnText: { color: "rgba(255,255,255,0.85)", fontSize: 11 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, padding: 14 },
  statLabel: { fontSize: 11, color: "rgba(20,24,33,0.5)", textTransform: "uppercase" },
  statValue: { fontSize: 18, fontWeight: "700", color: COLORS.ink, marginTop: 4 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, padding: 14, marginBottom: 12 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  childName: { fontSize: 16, fontWeight: "700", color: COLORS.ink },
  childMeta: { fontSize: 12, color: "rgba(20,24,33,0.5)", marginTop: 2 },
  mealsBtn: { backgroundColor: COLORS.paper, borderWidth: 1, borderColor: COLORS.line, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  mealsBtnText: { fontSize: 11, color: COLORS.ink },
  owedLine: { fontSize: 13, color: COLORS.ink, marginTop: 8, marginBottom: 6 },
  invRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 1, borderTopColor: COLORS.line },
  invMonth: { fontSize: 12, color: COLORS.ink, flex: 1 },
  invAmount: { fontSize: 11, color: "rgba(20,24,33,0.6)", marginRight: 8 },
  noInvoice: { fontSize: 12, color: "rgba(20,24,33,0.4)", marginTop: 4 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 20 },
  paymentsLink: { alignItems: "center", paddingVertical: 12 },
  paymentsLinkText: { color: COLORS.navy, fontSize: 14, fontWeight: "600" },
});

export default ParentDashboardScreen;
