import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, ScreenModal, Field, PrimaryButton, ErrorText, Card } from "../../components/UI";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { COLORS } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

const AddFoodModal = ({ visible, onClose, onSaved }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Magaca cuntada waa waajib.");
    setSaving(true);
    try {
      await staffApi.post("/foods", { name, category: category || undefined });
      setName(""); setCategory("");
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenModal visible={visible} title="Cunto Cusub" onClose={onClose}>
      <ErrorText text={error} />
      <Field label="Magaca" value={name} onChangeText={setName} />
      <Field label="Qaybta (ikhtiyaari)" value={category} onChangeText={setCategory} placeholder="grain, protein..." />
      <PrimaryButton title={saving ? "..." : "Kaydi"} onPress={submit} loading={saving} />
    </ScreenModal>
  );
};

const StaffFoodsScreen = ({ navigation }) => {
  const { staff } = useAuth();
  const [foods, setFoods] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const load = useCallback(async () => {
    const res = await staffApi.get("/foods");
    setFoods(res.data.foods);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (f) => {
    await staffApi.put(`/foods/${f.id}`, { isActive: !f.isActive });
    load();
  };

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Cuntooyinka" onBack={() => navigation.goBack()} />
      <View style={{ padding: 14, paddingBottom: 0 }}>
        <PrimaryButton title="+ Cunto Cusub" onPress={() => setShowAdd(true)} />
      </View>
      <FlatList
        data={foods || []}
        keyExtractor={(f) => f.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        renderItem={({ item: f }) => (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{f.name}</Text>
              <Text style={[styles.status, { color: f.isActive ? COLORS.success : COLORS.danger }]}>{f.isActive ? "Firfircoon" : "Xiran"}</Text>
            </View>
            {f.category ? <Text style={styles.meta}>{f.category}</Text> : null}
            <View style={[styles.rowBetween, { marginTop: 8 }]}>
              <TouchableOpacity onPress={() => toggleActive(f)}><Text style={styles.link}>{f.isActive ? "Xir" : "Furan"}</Text></TouchableOpacity>
              {staff?.role === "admin" && (
                <TouchableOpacity onPress={() => { setDeleteError(""); setDeleting(f); }}><Text style={styles.deleteText}>Tirtir</Text></TouchableOpacity>
              )}
            </View>
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Cunto lama helin.</Text>}
      />
      <AddFoodModal visible={showAdd} onClose={() => setShowAdd(false)} onSaved={load} />
      <ConfirmDeleteModal
        visible={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await staffApi.delete(`/foods/${deleting.id}`); load(); }}
        title="Tirtir Cuntada"
        description={deleting ? `Ma hubtaa inaad tirtirayso "${deleting.name}"? Haddii ay ku jirto menu hore, isticmaal "Xir" halkii.${deleteError}` : ""}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 15, fontWeight: "600", color: COLORS.ink },
  meta: { fontSize: 12, color: "rgba(20,24,33,0.55)", marginTop: 2 },
  status: { fontSize: 11, fontWeight: "600" },
  link: { color: COLORS.navy, fontSize: 13 },
  deleteText: { color: COLORS.danger, fontSize: 13 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 40 },
});

export default StaffFoodsScreen;
