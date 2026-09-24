import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, ScreenModal, Field, PrimaryButton, ErrorText, Card, Chip } from "../../components/UI";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { COLORS, formatMoney } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

const AddPlanModal = ({ visible, onClose, onSaved }) => {
  const [name, setName] = useState("");
  const [mealTypes, setMealTypes] = useState([]);
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const toggle = (t) => setMealTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const submit = async () => {
    setError("");
    if (!name.trim() || mealTypes.length === 0 || !monthlyPrice) return setError("Dhammaan beeraha waa waajib.");
    setSaving(true);
    try {
      await staffApi.post("/meal-plans", { name, mealTypes, monthlyPrice: Number(monthlyPrice) });
      setName(""); setMealTypes([]); setMonthlyPrice("");
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenModal visible={visible} title="Meal Plan Cusub" onClose={onClose}>
      <ErrorText text={error} />
      <Field label="Magaca" value={name} onChangeText={setName} placeholder='tusaale: "KG Full Board"' />
      <Text style={styles.label}>Noocyada Cuntada</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {MEAL_TYPES.map((t) => (
          <Chip key={t} label={t} active={mealTypes.includes(t)} onPress={() => toggle(t)} />
        ))}
      </View>
      <Field label="Qiimaha Bishii" value={monthlyPrice} onChangeText={setMonthlyPrice} keyboardType="numeric" />
      <PrimaryButton title={saving ? "..." : "Kaydi"} onPress={submit} loading={saving} />
    </ScreenModal>
  );
};

const StaffMealPlansScreen = ({ navigation }) => {
  const { staff } = useAuth();
  const [plans, setPlans] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    const res = await staffApi.get("/meal-plans");
    setPlans(res.data.mealPlans);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (p) => {
    await staffApi.put(`/meal-plans/${p.id}`, { isActive: !p.isActive });
    load();
  };

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Meal Plans" onBack={() => navigation.goBack()} />
      <View style={{ padding: 14, paddingBottom: 0 }}>
        <PrimaryButton title="+ Meal Plan Cusub" onPress={() => setShowAdd(true)} />
      </View>
      <FlatList
        data={plans || []}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        renderItem={({ item: p }) => (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.price}>{formatMoney(p.monthlyPrice)}/bishii</Text>
            </View>
            <Text style={styles.meta}>{p.mealTypes.join(", ")}</Text>
            <View style={[styles.rowBetween, { marginTop: 8 }]}>
              <TouchableOpacity onPress={() => toggleActive(p)}>
                <Text style={styles.link}>{p.isActive ? "Xir" : "Furan"}</Text>
              </TouchableOpacity>
              {staff?.role === "admin" && (
                <TouchableOpacity onPress={() => setDeleting(p)}>
                  <Text style={styles.deleteText}>Tirtir</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Meal plan lama helin.</Text>}
      />
      <AddPlanModal visible={showAdd} onClose={() => setShowAdd(false)} onSaved={load} />
      <ConfirmDeleteModal
        visible={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await staffApi.delete(`/meal-plans/${deleting.id}`); load(); }}
        title="Tirtir Meal Plan-ka"
        description={deleting ? `Ma hubtaa inaad tirtirayso "${deleting.name}"?` : ""}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 15, fontWeight: "700", color: COLORS.ink },
  price: { fontSize: 13, fontWeight: "600", color: COLORS.ink },
  meta: { fontSize: 12, color: "rgba(20,24,33,0.55)", marginTop: 2, textTransform: "capitalize" },
  link: { color: COLORS.navy, fontSize: 13 },
  deleteText: { color: COLORS.danger, fontSize: 13 },
  label: { fontSize: 13, color: "rgba(20,24,33,0.7)", marginTop: 10, marginBottom: 6 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 40 },
});

export default StaffMealPlansScreen;
