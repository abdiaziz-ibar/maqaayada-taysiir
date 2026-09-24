import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, Card, InfoRow, Chip, Loading } from "../../components/UI";
import { COLORS, formatMoney, monthLabel } from "../../utils/format";

const StaffProfitLossScreen = ({ navigation }) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    staffApi.get("/reports/profit-loss", { params: { year, month } }).then((res) => setData(res.data));
  }, [year, month]);

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Xisaab-xirka" onBack={() => navigation.goBack()} />
      <View style={{ paddingHorizontal: 14, paddingTop: 14 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <Chip key={m} label={monthLabel(m)} active={month === m} onPress={() => setMonth(m)} />
          ))}
        </View>
      </View>
      {!data ? (
        <Loading />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Dakhliga</Text>
              <Text style={[styles.statValue, { color: COLORS.success }]}>{formatMoney(data.income.total)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Kharashka</Text>
              <Text style={[styles.statValue, { color: COLORS.danger }]}>{formatMoney(data.expenses.total)}</Text>
            </View>
          </View>
          <View style={[styles.netCard, { borderColor: data.isLoss ? COLORS.danger : COLORS.success }]}>
            <Text style={styles.netLabel}>Farqiga (Net)</Text>
            <Text style={[styles.netValue, { color: data.isLoss ? COLORS.danger : COLORS.success }]}>{formatMoney(data.net)}</Text>
            <Text style={[styles.netNote, { color: data.isLoss ? COLORS.danger : COLORS.success }]}>
              {data.isLoss ? "⚠ Qasaaro ayaa jira bishan" : "✓ Faa'iido ayaa jira bishan"}
            </Text>
          </View>

          <Card>
            <Text style={styles.cardTitle}>Dakhliga</Text>
            <InfoRow label="Lacagaha Bille" value={formatMoney(data.income.mealFeePayments)} />
            <InfoRow label="Cunto Mar-mar ah" value={formatMoney(data.income.occasionalMeals)} />
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Kharashka Qaybaha</Text>
            {Object.entries(data.expenses.byCategory).map(([cat, amt]) => (
              <InfoRow key={cat} label={cat} value={formatMoney(amt)} />
            ))}
            {Object.keys(data.expenses.byCategory).length === 0 && <Text style={styles.empty}>Kharash lama diiwaan gelin.</Text>}
          </Card>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  statBox: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, padding: 14 },
  statLabel: { fontSize: 11, color: "rgba(20,24,33,0.5)", textTransform: "uppercase" },
  statValue: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  netCard: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 2, padding: 16, marginBottom: 12 },
  netLabel: { fontSize: 11, color: "rgba(20,24,33,0.5)", textTransform: "uppercase" },
  netValue: { fontSize: 24, fontWeight: "700", marginTop: 4 },
  netNote: { fontSize: 12, marginTop: 4 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: COLORS.ink, marginBottom: 6 },
  empty: { color: "rgba(20,24,33,0.4)", fontSize: 13 },
});

export default StaffProfitLossScreen;
