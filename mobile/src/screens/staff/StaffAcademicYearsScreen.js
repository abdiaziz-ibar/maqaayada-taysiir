import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, ScreenModal, Field, PrimaryButton, ErrorText, Card, Badge } from "../../components/UI";
import { COLORS, formatDate } from "../../utils/format";

const AddYearModal = ({ visible, onClose, onSaved }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError("");
    if (!name.trim() || !startDate || !endDate) return setError("Dhammaan beeraha waa waajib.");
    setSaving(true);
    try {
      await staffApi.post("/academic-years", { name, startDate, endDate });
      setName(""); setStartDate(""); setEndDate("");
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenModal visible={visible} title="Sannad Cusub" onClose={onClose}>
      <ErrorText text={error} />
      <Field label="Magaca (tusaale 2027-2028)" value={name} onChangeText={setName} />
      <Field label="Bilowga (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} placeholder="2027-09-01" />
      <Field label="Dhammaadka (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} placeholder="2028-08-31" />
      <PrimaryButton title={saving ? "..." : "Kaydi"} onPress={submit} loading={saving} />
    </ScreenModal>
  );
};

const StaffAcademicYearsScreen = ({ navigation }) => {
  const [years, setYears] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    const res = await staffApi.get("/academic-years");
    setYears(res.data.academicYears);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const makeActive = async (y) => {
    await staffApi.put(`/academic-years/${y.id}`, { isActive: true });
    load();
  };

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Sannadaha Dugsiga" onBack={() => navigation.goBack()} />
      <View style={{ padding: 14, paddingBottom: 0 }}>
        <PrimaryButton title="+ Sannad Cusub" onPress={() => setShowAdd(true)} />
      </View>
      <FlatList
        data={years || []}
        keyExtractor={(y) => y.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        renderItem={({ item: y }) => (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{y.name}</Text>
              <Badge text={y.isActive ? "Firfircoon" : "Aan Firfircoonayn"} color={y.isActive ? COLORS.success : COLORS.danger} />
            </View>
            <Text style={styles.meta}>{formatDate(y.startDate)} - {formatDate(y.endDate)}</Text>
            {!y.isActive && <TouchableOpacity onPress={() => makeActive(y)}><Text style={styles.link}>Ka dhig Active</Text></TouchableOpacity>}
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Sannad lama helin.</Text>}
      />
      <AddYearModal visible={showAdd} onClose={() => setShowAdd(false)} onSaved={load} />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 15, fontWeight: "700", color: COLORS.ink },
  meta: { fontSize: 12, color: "rgba(20,24,33,0.55)", marginTop: 2, marginBottom: 6 },
  link: { color: COLORS.navy, fontSize: 13 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 40 },
});

export default StaffAcademicYearsScreen;
