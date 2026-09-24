import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, ScreenModal, Field, PrimaryButton, ErrorText, Card, Badge } from "../../components/UI";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { COLORS } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

const AddSectionInline = ({ classId, onAdded }) => {
  const [name, setName] = useState("");
  const submit = async () => {
    if (!name.trim()) return;
    await staffApi.post(`/classes/${classId}/sections`, { name });
    setName("");
    onAdded();
  };
  return (
    <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
      <Field style={{ flex: 1 }} placeholder="Section cusub" value={name} onChangeText={setName} />
      <TouchableOpacity style={styles.addSectionBtn} onPress={submit}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const AddClassModal = ({ visible, onClose, onSaved }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Magaca fasalka waa waajib.");
    setSaving(true);
    try {
      await staffApi.post("/classes", { name });
      setName("");
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenModal visible={visible} title="Fasal Cusub" onClose={onClose}>
      <ErrorText text={error} />
      <Field label="Magaca Fasalka" value={name} onChangeText={setName} />
      <PrimaryButton title={saving ? "..." : "Kaydi"} onPress={submit} loading={saving} />
    </ScreenModal>
  );
};

const StaffClassesScreen = ({ navigation }) => {
  const { staff } = useAuth();
  const [classes, setClasses] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    const res = await staffApi.get("/classes");
    setClasses(res.data.classes);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Fasallada" onBack={() => navigation.goBack()} />
      <View style={{ padding: 14, paddingBottom: 0 }}>
        <PrimaryButton title="+ Fasal Cusub" onPress={() => setShowAdd(true)} />
      </View>
      <FlatList
        data={classes || []}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        renderItem={({ item: c }) => (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{c.name}</Text>
              {staff?.role === "admin" && (
                <TouchableOpacity onPress={() => setDeleting(c)}>
                  <Text style={styles.deleteText}>Tirtir</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
              {c.sections.map((s) => (
                <Badge key={s.id} text={s.name} color={COLORS.navy} />
              ))}
            </View>
            <AddSectionInline classId={c.id} onAdded={load} />
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Fasal lama helin.</Text>}
      />
      <AddClassModal visible={showAdd} onClose={() => setShowAdd(false)} onSaved={load} />
      <ConfirmDeleteModal
        visible={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await staffApi.delete(`/classes/${deleting.id}`); load(); }}
        title="Tirtir Fasalka"
        description={deleting ? `Ma hubtaa inaad tirtirayso "${deleting.name}"?` : ""}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 15, fontWeight: "700", color: COLORS.ink },
  deleteText: { color: COLORS.danger, fontSize: 12 },
  addSectionBtn: { backgroundColor: COLORS.navy, borderRadius: 8, paddingHorizontal: 14, justifyContent: "center", alignItems: "center" },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 40 },
});

export default StaffClassesScreen;
