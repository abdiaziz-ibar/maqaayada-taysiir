import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import staffApi from "../../api/staffClient";
import { StaffHeader, ChipRow, Chip, Field, PrimaryButton, ErrorText, SuccessText, Loading } from "../../components/UI";
import { COLORS, formatDate, formatMoney, mealTypeLabel, todayIso } from "../../utils/format";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

const StaffOccasionalMealsScreen = () => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mealType, setMealType] = useState("lunch");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [meals, setMeals] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadMeals = useCallback(async () => {
    const res = await staffApi.get("/occasional-meals");
    setMeals(res.data.meals);
  }, []);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  useEffect(() => {
    if (!q.trim()) return setResults([]);
    const t = setTimeout(async () => {
      const res = await staffApi.get("/students/search", { params: { q } });
      setResults(res.data.students);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const record = async () => {
    setError(""); setMessage("");
    setSaving(true);
    try {
      await staffApi.post("/occasional-meals", { studentId: selected.id, mealType, date: todayIso() });
      setMessage(`${selected.fullName} waa la diiwaan geliyay.`);
      setSelected(null);
      setQ("");
      loadMeals();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeals();
    setRefreshing(false);
  };

  return (
    <View style={styles.flex}>
      <StaffHeader title="Cunto Mar-mar ah" />
      <FlatList
        data={meals || []}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.card}>
            <ErrorText text={error} />
            <SuccessText text={message} />
            {!selected ? (
              <>
                <Field placeholder="Raadi magaca ama code-ka ardayga..." value={q} onChangeText={setQ} />
                {results.map((s) => (
                  <TouchableOpacity key={s.id} style={styles.resultRow} onPress={() => { setSelected(s); setResults([]); }}>
                    <Text style={styles.resultText}>{s.fullName} ({s.studentCode})</Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <>
                <View style={styles.selectedRow}>
                  <Text style={styles.selectedText}>{selected.fullName} ({selected.studentCode})</Text>
                  <TouchableOpacity onPress={() => setSelected(null)}><Text style={styles.change}>Beddel</Text></TouchableOpacity>
                </View>
                <Text style={styles.label}>Nooca Cuntada</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {MEAL_TYPES.map((t) => (
                    <Chip key={t} label={mealTypeLabel(t)} active={mealType === t} onPress={() => setMealType(t)} />
                  ))}
                </View>
                <PrimaryButton title={saving ? "..." : "Diiwaan Geli"} onPress={record} loading={saving} />
              </>
            )}
          </View>
        }
        renderItem={({ item: m }) => (
          <View style={styles.mealCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{m.student.fullName}</Text>
              <Text style={styles.meta}>{formatDate(m.date)} · {mealTypeLabel(m.mealType)}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.amount}>{formatMoney(m.amountCharged)}</Text>
              <Text style={[styles.status, { color: m.paymentStatus === "paid" ? COLORS.success : COLORS.danger }]}>
                {m.paymentStatus === "paid" ? "La Bixiyey" : "Lama Bixin"}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={meals ? <Text style={styles.empty}>Weli lama diiwaan gelin.</Text> : <ActivityIndicator color={COLORS.navy} style={{ marginTop: 20 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.line },
  resultRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  resultText: { fontSize: 14, color: COLORS.ink },
  selectedRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.paper, borderRadius: 8, padding: 10, marginBottom: 10 },
  selectedText: { fontSize: 14, fontWeight: "600", color: COLORS.ink },
  change: { color: COLORS.navy, fontSize: 13 },
  label: { fontSize: 13, color: "rgba(20,24,33,0.7)", marginBottom: 6 },
  mealCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 12,
    marginBottom: 8,
  },
  name: { fontSize: 14, fontWeight: "600", color: COLORS.ink },
  meta: { fontSize: 12, color: "rgba(20,24,33,0.5)", marginTop: 2 },
  amount: { fontSize: 14, fontWeight: "700", color: COLORS.ink },
  status: { fontSize: 11, marginTop: 2 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 20 },
});

export default StaffOccasionalMealsScreen;
