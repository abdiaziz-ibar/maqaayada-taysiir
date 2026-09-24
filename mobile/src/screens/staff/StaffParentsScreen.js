import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, ScreenModal, Field, PrimaryButton, ErrorText, Loading } from "../../components/UI";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { COLORS } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

const ParentModal = ({ visible, onClose, onSaved, editing }) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [alternativePhone, setAlternativePhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setFullName(editing.fullName); setPhone(editing.phone);
      setAlternativePhone(editing.alternativePhone || ""); setAddress(editing.address || ""); setEmail(editing.email || "");
    } else {
      setFullName(""); setPhone(""); setAlternativePhone(""); setAddress(""); setEmail("");
    }
    setError("");
  }, [visible, editing]);

  const submit = async () => {
    setError("");
    if (!fullName.trim() || !phone.trim()) return setError("Magaca iyo telefoonka waa waajib.");
    setSaving(true);
    try {
      const payload = { fullName, phone, alternativePhone: alternativePhone || undefined, address: address || undefined, email: email || undefined };
      if (editing) await staffApi.put(`/parents/${editing._id}`, payload);
      else await staffApi.post("/parents", payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenModal visible={visible} title={editing ? "Wax Ka Beddel Waalidka" : "Waalid Cusub"} onClose={onClose}>
      <ErrorText text={error} />
      <Field label="Magaca Waalidka" value={fullName} onChangeText={setFullName} />
      <Field label="Telefoonka" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Field label="Telefoon Kale (ikhtiyaari)" value={alternativePhone} onChangeText={setAlternativePhone} keyboardType="phone-pad" />
      <Field label="Cinwaanka (ikhtiyaari)" value={address} onChangeText={setAddress} />
      <Field label="Email (ikhtiyaari)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <PrimaryButton title={saving ? "..." : "Kaydi"} onPress={submit} loading={saving} />
    </ScreenModal>
  );
};

const StaffParentsScreen = ({ navigation }) => {
  const { staff } = useAuth();
  const [search, setSearch] = useState("");
  const [parents, setParents] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    const res = await staffApi.get("/parents", { params: search ? { search } : {} });
    setParents(res.data.parents);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => { load(); }, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Waalidiinta" onBack={() => navigation.goBack()} />
      <View style={{ padding: 14, paddingBottom: 0 }}>
        <Field placeholder="Raadi magac ama telefoon..." value={search} onChangeText={setSearch} />
        <PrimaryButton title="+ Waalid Cusub" onPress={() => { setEditing(null); setShowAdd(true); }} />
      </View>
      {!parents ? (
        <Loading />
      ) : (
        <FlatList
          data={parents}
          keyExtractor={(p) => p._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          renderItem={({ item: p }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ParentDetail", { id: p._id })}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{p.fullName}</Text>
                  <Text style={styles.meta}>{p.parentCode} · {p.phone}</Text>
                  <Text style={styles.meta}>{p.students?.map((s) => s.fullName).join(", ") || "-"}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 14 }}>
                  <TouchableOpacity onPress={(e) => { e.stopPropagation(); setEditing(p); setShowAdd(true); }}>
                    <Text style={styles.editText}>Wax ka beddel</Text>
                  </TouchableOpacity>
                  {staff?.role === "admin" && (
                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); setDeleting(p); }}>
                      <Text style={styles.deleteText}>Tirtir</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Waalid lama helin.</Text>}
        />
      )}
      <ParentModal visible={showAdd} onClose={() => setShowAdd(false)} onSaved={load} editing={editing} />
      <ConfirmDeleteModal
        visible={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await staffApi.delete(`/parents/${deleting._id}`); load(); }}
        title="Tirtir Waalidka"
        description={deleting ? `Ma hubtaa inaad tirtirayso "${deleting.fullName}"?` : ""}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, padding: 12, marginBottom: 8 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  name: { fontSize: 15, fontWeight: "600", color: COLORS.ink },
  meta: { fontSize: 12, color: "rgba(20,24,33,0.55)", marginTop: 2 },
  editText: { fontSize: 12, color: COLORS.navy },
  deleteText: { fontSize: 12, color: COLORS.danger },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 40 },
});

export default StaffParentsScreen;
