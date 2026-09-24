import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import api from "../api/client";
import { ScreenHeader, Loading } from "../components/UI";
import { COLORS, formatDate, formatMoney, monthLabel } from "../utils/format";

const ParentPaymentsScreen = ({ navigation }) => {
  const [payments, setPayments] = useState(null);

  useEffect(() => {
    api.get("/parent-portal/payments").then((res) => setPayments(res.data.payments));
  }, []);

  if (!payments) return <Loading />;

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Taariikhda Lacagta" onBack={() => navigation.goBack()} />
      <FlatList
        data={payments}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        renderItem={({ item: p }) => (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.receipt}>{p.receiptNumber}</Text>
              <Text style={styles.amount}>{formatMoney(p.amount)}</Text>
            </View>
            <Text style={styles.meta}>{formatDate(p.paymentDate)} · {p.method}</Text>
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
  card: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, padding: 12, marginBottom: 8 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  receipt: { fontSize: 13, fontWeight: "700", color: COLORS.ink },
  amount: { fontSize: 14, fontWeight: "700", color: COLORS.success },
  meta: { fontSize: 12, color: "rgba(20,24,33,0.55)", marginTop: 4 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 40 },
});

export default ParentPaymentsScreen;
