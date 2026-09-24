import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, ChipRow, Chip, Badge, Loading } from "../../components/UI";
import { COLORS, formatMoney, monthLabel, invoiceStatusLabel, invoiceStatusColor } from "../../utils/format";

const StaffMonthlyReportScreen = ({ navigation }) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  const [rows, setRows] = useState(null);

  useEffect(() => {
    setRows(null);
    staffApi.get("/reports/monthly-payments", { params: { year, month } }).then((res) => setRows(res.data.rows));
  }, [year, month]);

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Warbixin Bille" onBack={() => navigation.goBack()} />
      <ChipRow>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <Chip key={m} label={monthLabel(m)} active={month === m} onPress={() => setMonth(m)} />
        ))}
      </ChipRow>
      {!rows ? (
        <Loading />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => r.parent.id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          renderItem={({ item: r }) => (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.name}>{r.parent.fullName}</Text>
                <Badge text={invoiceStatusLabel(r.status)} color={invoiceStatusColor(r.status)} />
              </View>
              <Text style={styles.meta}>{r.students} arday · La Rabo: {formatMoney(r.totalDue)} · La Bixiyey: {formatMoney(r.paid)}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Invoice lama helin bishaan.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, padding: 12, marginBottom: 8 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 14, fontWeight: "600", color: COLORS.ink },
  meta: { fontSize: 12, color: "rgba(20,24,33,0.55)", marginTop: 4 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 40 },
});

export default StaffMonthlyReportScreen;
