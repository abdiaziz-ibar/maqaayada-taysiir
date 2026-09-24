import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, Card, InfoRow, Loading } from "../../components/UI";
import { COLORS, formatMoney, monthLabel } from "../../utils/format";

const StaffAnnualReportScreen = ({ navigation }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    staffApi.get("/reports/annual").then((res) => setData(res.data));
  }, []);

  if (!data) return <Loading />;

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Warbixin Sannadeed" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
        <Text style={styles.yearTitle}>{data.academicYear.name}</Text>
        {data.months.map((m) => (
          <Card key={`${m.year}-${m.month}`}>
            <Text style={styles.monthTitle}>{monthLabel(m.month)} {m.year}</Text>
            <InfoRow label="La Rabo" value={formatMoney(m.totalDue)} />
            <InfoRow label="La Bixiyey" value={formatMoney(m.totalPaid)} />
            <InfoRow label="La Sugayo" value={formatMoney(m.outstanding)} />
          </Card>
        ))}
        {data.months.length === 0 && <Text style={styles.empty}>Ma jiraan xog.</Text>}
        <Card style={{ borderColor: COLORS.navy, borderWidth: 2 }}>
          <Text style={styles.monthTitle}>Wadarta Sannadka</Text>
          <InfoRow label="La Rabo" value={formatMoney(data.totals.totalDue)} />
          <InfoRow label="La Bixiyey" value={formatMoney(data.totals.totalPaid)} />
          <InfoRow label="La Sugayo" value={formatMoney(data.totals.outstanding)} />
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  yearTitle: { fontSize: 16, fontWeight: "700", color: COLORS.ink, marginBottom: 12 },
  monthTitle: { fontSize: 14, fontWeight: "700", color: COLORS.ink, marginBottom: 6 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 20 },
});

export default StaffAnnualReportScreen;
