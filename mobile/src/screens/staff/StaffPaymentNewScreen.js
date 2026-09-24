import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, Field, PrimaryButton, ErrorText, Chip } from "../../components/UI";
import { COLORS, formatMoney, monthLabel } from "../../utils/format";

const METHODS = ["Cash", "Bank", "Mobile Money", "Other"];

const StaffPaymentNewScreen = ({ navigation }) => {
  const [parentSearch, setParentSearch] = useState("");
  const [parentOptions, setParentOptions] = useState([]);
  const [parent, setParent] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [method, setMethod] = useState("Cash");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!parentSearch.trim() || parent) return setParentOptions([]);
    const t = setTimeout(async () => {
      const res = await staffApi.get("/parents", { params: { search: parentSearch } });
      setParentOptions(res.data.parents);
    }, 300);
    return () => clearTimeout(t);
  }, [parentSearch, parent]);

  useEffect(() => {
    if (!parent) return;
    staffApi.get("/invoices", { params: { parentId: parent._id } }).then((res) => {
      setInvoices(res.data.invoices.filter((i) => i.status !== "paid"));
    });
  }, [parent]);

  const setAlloc = (invoiceId, value) => setAllocations((prev) => ({ ...prev, [invoiceId]: value }));
  const totalAmount = Object.values(allocations).reduce((s, v) => s + (Number(v) || 0), 0);

  const submit = async () => {
    setError("");
    const allocationList = Object.entries(allocations)
      .filter(([, v]) => Number(v) > 0)
      .map(([invoiceId, amount]) => ({ invoiceId, amount: Number(amount) }));
    if (allocationList.length === 0) return setError("Geli lacag ugu yaraan hal invoice.");
    setSaving(true);
    try {
      await staffApi.post("/payments", { parentId: parent._id, amount: totalAmount, method, allocations: allocationList });
      navigation.goBack();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Diiwaan Geli Lacag" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 60 }}>
        <ErrorText text={error} />

        {!parent ? (
          <View style={styles.card}>
            <Field placeholder="Raadi waalid (magac/telefoon)..." value={parentSearch} onChangeText={setParentSearch} />
            {parentOptions.map((p) => (
              <TouchableOpacity key={p._id} style={styles.resultRow} onPress={() => setParent(p)}>
                <Text style={styles.resultText}>{p.fullName} ({p.phone})</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <>
            <View style={[styles.card, styles.rowBetween]}>
              <Text style={styles.parentName}>{parent.fullName} ({parent.phone})</Text>
              <TouchableOpacity onPress={() => { setParent(null); setInvoices([]); setAllocations({}); }}>
                <Text style={styles.change}>Beddel</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Invoice-yada Furan</Text>
            {invoices.map((inv) => {
              const balance = inv.amountDue - inv.amountPaid;
              return (
                <View key={inv.id} style={styles.invoiceCard}>
                  <Text style={styles.invoiceLine}>{inv.student.fullName} — {monthLabel(inv.month)} {inv.year}</Text>
                  <Text style={styles.invoiceMeta}>Ku Dhiman: {formatMoney(balance)}</Text>
                  <Field
                    keyboardType="numeric"
                    placeholder="0"
                    value={allocations[inv.id] ? String(allocations[inv.id]) : ""}
                    onChangeText={(v) => setAlloc(inv.id, v)}
                  />
                </View>
              );
            })}
            {invoices.length === 0 && <Text style={styles.empty}>Ma jiraan invoice furan.</Text>}

            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.totalLabel}>Wadarta Lacagta</Text>
                <Text style={styles.totalValue}>{formatMoney(totalAmount)}</Text>
              </View>
              <Text style={styles.label}>Habka Lacagta</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {METHODS.map((m) => (
                  <Chip key={m} label={m} active={method === m} onPress={() => setMethod(m)} />
                ))}
              </View>
              <PrimaryButton title={saving ? "..." : "Kaydi Lacagta"} onPress={submit} loading={saving} disabled={totalAmount <= 0} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.line },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resultRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  resultText: { fontSize: 14, color: COLORS.ink },
  parentName: { fontSize: 14, fontWeight: "700", color: COLORS.ink },
  change: { color: COLORS.navy, fontSize: 13 },
  sectionTitle: { fontSize: 13, color: "rgba(20,24,33,0.5)", textTransform: "uppercase", marginBottom: 8 },
  invoiceCard: { backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.line, padding: 12, marginBottom: 8 },
  invoiceLine: { fontSize: 14, fontWeight: "600", color: COLORS.ink },
  invoiceMeta: { fontSize: 12, color: "rgba(20,24,33,0.55)", marginBottom: 6, marginTop: 2 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginBottom: 14 },
  totalLabel: { fontSize: 15, color: COLORS.ink },
  totalValue: { fontSize: 18, fontWeight: "700", color: COLORS.ink },
  label: { fontSize: 13, color: "rgba(20,24,33,0.7)", marginTop: 12, marginBottom: 6 },
});

export default StaffPaymentNewScreen;
