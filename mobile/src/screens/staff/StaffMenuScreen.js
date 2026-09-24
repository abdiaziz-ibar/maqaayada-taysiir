import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, Field, Chip, PrimaryButton } from "../../components/UI";
import { COLORS, todayIso, mealTypeLabel } from "../../utils/format";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

const StaffMenuScreen = ({ navigation }) => {
  const [date, setDate] = useState(todayIso());
  const [mealType, setMealType] = useState("lunch");
  const [foods, setFoods] = useState([]);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    staffApi.get("/foods", { params: { activeOnly: "true" } }).then((res) => setFoods(res.data.foods));
  }, []);

  useEffect(() => {
    setSaved(false);
    staffApi.get("/menus", { params: { startDate: date, endDate: date } }).then((res) => {
      const existing = res.data.menus.find((m) => m.mealType === mealType);
      setSelected(existing ? existing.items.map((it) => it.foodId) : []);
    });
  }, [date, mealType]);

  const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const save = async () => {
    setSaving(true);
    try {
      await staffApi.put("/menus", { date, mealType, foodIds: selected });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Menu-ga" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
        <Field label="Taariikh" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <Text style={styles.label}>Nooca Cuntada</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {MEAL_TYPES.map((t) => (
            <Chip key={t} label={mealTypeLabel(t)} active={mealType === t} onPress={() => setMealType(t)} />
          ))}
        </View>
        <Text style={styles.label}>Dooro Cuntooyinka</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {foods.map((f) => (
            <TouchableOpacity key={f.id} style={[styles.foodChip, selected.includes(f.id) && styles.foodChipActive]} onPress={() => toggle(f.id)}>
              <Text style={[styles.foodChipText, selected.includes(f.id) && styles.foodChipTextActive]}>{f.name}</Text>
            </TouchableOpacity>
          ))}
          {foods.length === 0 && <Text style={styles.empty}>Weli cunto lama darin ("Cuntooyinka" bogga).</Text>}
        </View>
        <PrimaryButton title={saving ? "..." : saved ? "Waa la Kaydiyay ✓" : "Kaydi Menu-ga"} onPress={save} loading={saving} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  label: { fontSize: 13, color: "rgba(20,24,33,0.7)", marginTop: 8, marginBottom: 6 },
  foodChip: { borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  foodChipActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  foodChipText: { fontSize: 12, color: COLORS.ink },
  foodChipTextActive: { color: "#fff" },
  empty: { color: "rgba(20,24,33,0.4)", fontSize: 13 },
});

export default StaffMenuScreen;
