import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, Chip, Badge, Loading, PrimaryButton } from "../../components/UI";
import { COLORS, formatMoney, monthLabel, invoiceStatusLabel, invoiceStatusColor } from "../../utils/format";

const StaffInvoicesScreen = ({ navigation }) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  const [invoices, setInvoices] = useState(null);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    const res = await staffApi.get("/invoices", { params: { year, month } });
    setInvoices(res.data.invoices);
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const generate = async () => {
    setGenerating(true);
    try {
      await staffApi.post("/invoices/generate", { year, month });
      await load();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Invoices" onBack={() => navigation.goBack()} />
      <View style={{ padding: 14, paddingBottom: 0 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <Chip key={m} label={monthLabel(m)} active={month === m} onPress={() => setMonth(m)} />
          ))}
        </View>
        <PrimaryButton title={generating ? "..." : `Dhalii Invoices — ${monthLabel(month)} ${year}`} onPress={generate} loading={generating} />
      </View>
      {!invoices ? (
        <Loading />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          renderItem={({ item: inv }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("StudentDetail", { id: inv.student.id })}>
              <View style={styles.rowBetween}>
                <Text style={styles.name}>{inv.student.fullName}</Text>
                <Badge text={invoiceStatusLabel(inv.status)} color={invoiceStatusColor(inv.status)} />
              </View>
              <Text style={styles.meta}>{inv.student.parent?.fullName} ({inv.student.parent?.phone})</Text>
              <Text style={styles.meta}>Ku Dhiman: {formatMoney(inv.amountDue - inv.amountPaid)} / {formatMoney(inv.amountDue)}</Text>
            </TouchableOpacity>
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

export default StaffInvoicesScreen;
