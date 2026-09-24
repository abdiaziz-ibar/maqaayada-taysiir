import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import staffApi from "../../api/staffClient";
import { StaffHeader, Loading } from "../../components/UI";
import { COLORS, formatDate, formatMoney, monthLabel } from "../../utils/format";

const StaffPaymentsScreen = ({ navigation }) => {
  const [payments, setPayments] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await staffApi.get("/payments");
    setPayments(res.data.payments);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!payments) return <Loading />;

  return (
    <View style={styles.flex}>
      <StaffHeader title="Lacag Bixinta" />
      <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate("PaymentNew")}>
        <Text style={styles.newBtnText}>+ Lacag Cusub</Text>
      </TouchableOpacity>
      <FlatList
        data={payments}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item: p }) => (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.receipt}>{p.receiptNumber}</Text>
              <Text style={styles.amount}>{formatMoney(p.amount)}</Text>
            </View>
            <Text style={styles.meta}>{p.parent?.fullName || "-"} · {formatDate(p.paymentDate)} · {p.method}</Text>
            <Text style={styles.meta}>
              {p.allocations.map((a) => `${a.invoice.student.fullName} (${monthLabel(a.invoice.month)})`).join(", ")}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Weli lacag lama bixin.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  newBtn: { backgroundColor: COLORS.brand, margin: 14, marginBottom: 0, borderRadius: 999, paddingVertical: 12, alignItems: "center" },
  newBtnText: { color: "#fff", fontWeight: "700" },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, padding: 12, marginBottom: 10 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  receipt: { fontSize: 13, fontWeight: "700", color: COLORS.ink },
  amount: { fontSize: 15, fontWeight: "700", color: COLORS.success },
  meta: { fontSize: 12, color: "rgba(20,24,33,0.55)", marginTop: 4 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 40 },
});

export default StaffPaymentsScreen;
