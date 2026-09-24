import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, Card, InfoRow, Loading, PrimaryButton } from "../../components/UI";
import { COLORS, formatMoney, formatDate, monthLabel } from "../../utils/format";

const StaffParentDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [data, setData] = useState(null);

  const load = () => staffApi.get(`/parents/${id}`).then((res) => setData(res.data));
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return <Loading />;
  const { parent, students, payments, financialSummary } = data;

  return (
    <View style={styles.flex}>
      <ScreenHeader title={parent.fullName} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
        <Card>
          <InfoRow label="Code" value={parent.parentCode} />
          <InfoRow label="Telefoon" value={parent.phone} />
          <InfoRow label="Cinwaan" value={parent.address} />
        </Card>

        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statLabel}>Bishii</Text><Text style={styles.statValue}>{formatMoney(financialSummary.totalMonthlyFees)}</Text></View>
          <View style={styles.statBox}><Text style={styles.statLabel}>La Bixiyey</Text><Text style={[styles.statValue, { color: COLORS.success }]}>{formatMoney(financialSummary.totalPaid)}</Text></View>
          <View style={styles.statBox}><Text style={styles.statLabel}>La Sugayo</Text><Text style={[styles.statValue, { color: COLORS.danger }]}>{formatMoney(financialSummary.totalOutstanding)}</Text></View>
        </View>

        <PrimaryButton title="Diiwaan Geli Lacag" onPress={() => navigation.navigate("PaymentNew")} />

        <Text style={styles.sectionTitle}>Carruurta</Text>
        {students.map((s) => (
          <TouchableOpacity key={s.id} onPress={() => navigation.navigate("StudentDetail", { id: s.id })}>
            <Card>
              <Text style={styles.childName}>{s.fullName}</Text>
              <InfoRow label="Fasalka" value={s.class?.name} />
              <InfoRow label="Meal Plan" value={s.mealPlan?.name || "Mar-mar oo kaliya"} />
            </Card>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Taariikhda Lacag Bixinta</Text>
        {payments.map((p) => (
          <Card key={p.id}>
            <View style={styles.rowBetween}>
              <Text style={styles.receipt}>{p.receiptNumber}</Text>
              <Text style={styles.amount}>{formatMoney(p.amount)}</Text>
            </View>
            <Text style={styles.meta}>{formatDate(p.paymentDate)} · {p.method}</Text>
            <Text style={styles.meta}>{p.allocations.map((a) => `${a.invoice.student.fullName} (${monthLabel(a.invoice.month)})`).join(", ")}</Text>
          </Card>
        ))}
        {payments.length === 0 && <Text style={styles.empty}>Weli lacag lama bixin.</Text>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  statBox: { alignItems: "center", flex: 1 },
  statLabel: { fontSize: 10, color: "rgba(20,24,33,0.5)", marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: "700", color: COLORS.ink },
  sectionTitle: { fontSize: 13, color: "rgba(20,24,33,0.5)", textTransform: "uppercase", marginBottom: 8, marginTop: 16 },
  childName: { fontSize: 15, fontWeight: "600", color: COLORS.ink, marginBottom: 4 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  receipt: { fontSize: 13, fontWeight: "700", color: COLORS.ink },
  amount: { fontSize: 14, fontWeight: "700", color: COLORS.success },
  meta: { fontSize: 12, color: "rgba(20,24,33,0.55)", marginTop: 2 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)" },
});

export default StaffParentDetailScreen;
