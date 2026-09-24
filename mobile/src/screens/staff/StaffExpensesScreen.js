import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, ScreenModal, Field, PrimaryButton, ErrorText, Loading } from "../../components/UI";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { COLORS, formatMoney, formatDate, todayIso, monthLabel } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

const CATEGORY_SUGGESTIONS = ["Alaabta Cuntada", "Qalabka", "Korontada iyo Biyaha", "Mushaharka", "Gaadiidka", "Kale"];

const AddExpenseModal = ({ visible, onClose, onSaved }) => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError("");
    if (!category.trim() || !description.trim() || !amount) return setError("Dhammaan beeraha waa waajib.");
    setSaving(true);
    try {
      await staffApi.post("/expenses", { category, description, amount: Number(amount), date: todayIso(), paymentMethod: "Cash" });
      setCategory(""); setDescription(""); setAmount("");
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenModal visible={visible} title="Kharash Cusub" onClose={onClose}>
      <ErrorText text={error} />
      <Field label="Qaybta" value={category} onChangeText={setCategory} placeholder="tusaale: Alaabta Cuntada" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8, marginBottom: 8 }}>
        {CATEGORY_SUGGESTIONS.map((c) => (
          <TouchableOpacity key={c} style={styles.suggestion} onPress={() => setCategory(c)}>
            <Text style={styles.suggestionText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Field label="Sharaxaad" value={description} onChangeText={setDescription} placeholder="tusaale: Bariis 50kg" />
      <Field label="Qadarka Lacagta" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0" />
      <PrimaryButton title={saving ? "..." : "Kaydi"} onPress={submit} loading={saving} />
    </ScreenModal>
  );
};

const StaffExpensesScreen = ({ navigation }) => {
  const { staff } = useAuth();
  const now = new Date();
  const [expenses, setExpenses] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    const res = await staffApi.get("/expenses", { params: { year: now.getFullYear(), month: now.getMonth() + 1 } });
    setExpenses(res.data.expenses);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  const total = (expenses || []).reduce((s, e) => s + e.amount, 0);

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Kharashaadka" onBack={() => navigation.goBack()} />
      <View style={{ padding: 14 }}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Wadarta Bishan ({monthLabel(now.getMonth() + 1)})</Text>
          <Text style={styles.totalValue}>{formatMoney(total)}</Text>
        </View>
        <PrimaryButton title="+ Kharash Cusub" onPress={() => setShowAdd(true)} />
      </View>
      {!expenses ? (
        <Loading />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ padding: 14, paddingTop: 0, paddingBottom: 40 }}
          renderItem={({ item: e }) => (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.category}>{e.category}</Text>
                <Text style={styles.amount}>{formatMoney(e.amount)}</Text>
              </View>
              <Text style={styles.meta}>{e.description}</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.meta}>{formatDate(e.date)} · {e.paymentMethod}</Text>
                {staff?.role === "admin" && (
                  <TouchableOpacity onPress={() => setDeleting(e)}>
                    <Text style={styles.deleteText}>Tirtir</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Kharash lama diiwaan gelin bishan.</Text>}
        />
      )}
      <AddExpenseModal visible={showAdd} onClose={() => setShowAdd(false)} onSaved={load} />
      <ConfirmDeleteModal
        visible={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await staffApi.delete(`/expenses/${deleting.id}`); load(); }}
        title="Tirtir Kharashka"
        description={deleting ? `Ma hubtaa inaad tirtirayso "${deleting.description}"?` : ""}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  totalCard: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, padding: 14, marginBottom: 12 },
  totalLabel: { fontSize: 11, color: "rgba(20,24,33,0.5)", textTransform: "uppercase" },
  totalValue: { fontSize: 20, fontWeight: "700", color: COLORS.danger, marginTop: 4 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, padding: 12, marginBottom: 8 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  category: { fontSize: 14, fontWeight: "600", color: COLORS.ink },
  amount: { fontSize: 14, fontWeight: "700", color: COLORS.danger },
  meta: { fontSize: 12, color: "rgba(20,24,33,0.55)", marginTop: 2 },
  deleteText: { fontSize: 12, color: COLORS.danger },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 20 },
  suggestion: { backgroundColor: COLORS.paper, borderWidth: 1, borderColor: COLORS.line, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  suggestionText: { fontSize: 12, color: COLORS.ink },
});

export default StaffExpensesScreen;
