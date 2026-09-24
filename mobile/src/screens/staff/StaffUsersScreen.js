import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, ScreenModal, Field, PrimaryButton, ErrorText, Card, Chip, Badge } from "../../components/UI";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { COLORS } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

const AddUserModal = ({ visible, onClose, onSaved }) => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError("");
    if (!fullName.trim() || !username.trim() || !password) return setError("Dhammaan beeraha waa waajib.");
    setSaving(true);
    try {
      await staffApi.post("/users", { fullName, username, password, role });
      setFullName(""); setUsername(""); setPassword(""); setRole("staff");
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenModal visible={visible} title="Isticmaale Cusub" onClose={onClose}>
      <ErrorText text={error} />
      <Field label="Magaca" value={fullName} onChangeText={setFullName} />
      <Field label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Text style={styles.label}>Doorka</Text>
      <View style={{ flexDirection: "row", gap: 6, marginBottom: 8 }}>
        <Chip label="Staff" active={role === "staff"} onPress={() => setRole("staff")} />
        <Chip label="Admin" active={role === "admin"} onPress={() => setRole("admin")} />
      </View>
      <PrimaryButton title={saving ? "..." : "Kaydi"} onPress={submit} loading={saving} />
    </ScreenModal>
  );
};

const StaffUsersScreen = ({ navigation }) => {
  const { staff: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    const res = await staffApi.get("/users");
    setUsers(res.data.users);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async (u) => {
    await staffApi.put(`/users/${u._id}`, { status: u.status === "active" ? "inactive" : "active" });
    load();
  };

  const toggleFinance = async (u) => {
    await staffApi.put(`/users/${u._id}`, { canManageFinance: !u.canManageFinance });
    load();
  };

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Isticmaalayaasha" onBack={() => navigation.goBack()} />
      <View style={{ padding: 14, paddingBottom: 0 }}>
        <PrimaryButton title="+ Isticmaale Cusub" onPress={() => setShowAdd(true)} />
      </View>
      <FlatList
        data={users || []}
        keyExtractor={(u) => u._id}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        renderItem={({ item: u }) => (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{u.fullName}</Text>
              <Badge text={u.status === "active" ? "Firfircoon" : "Xiran"} color={u.status === "active" ? COLORS.success : COLORS.danger} />
            </View>
            <Text style={styles.meta}>{u.username} · {u.role}</Text>
            <View style={[styles.rowBetween, { marginTop: 8 }]}>
              <TouchableOpacity onPress={() => toggleStatus(u)}><Text style={styles.link}>{u.status === "active" ? "Xir" : "Furan"}</Text></TouchableOpacity>
              {u.role === "staff" && (
                <TouchableOpacity onPress={() => toggleFinance(u)}>
                  <Text style={styles.link}>{u.canManageFinance ? "Maaliyad: Ogolaaday" : "Maaliyad: Lama Ogolayn"}</Text>
                </TouchableOpacity>
              )}
              {u._id !== me?._id && (
                <TouchableOpacity onPress={() => setDeleting(u)}><Text style={styles.deleteText}>Tirtir</Text></TouchableOpacity>
              )}
            </View>
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Isticmaale lama helin.</Text>}
      />
      <AddUserModal visible={showAdd} onClose={() => setShowAdd(false)} onSaved={load} />
      <ConfirmDeleteModal
        visible={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await staffApi.delete(`/users/${deleting._id}`); load(); }}
        title="Tirtir Isticmaalaha"
        description={deleting ? `Ma hubtaa inaad tirtirayso "${deleting.fullName}"?` : ""}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 },
  name: { fontSize: 15, fontWeight: "700", color: COLORS.ink },
  meta: { fontSize: 12, color: "rgba(20,24,33,0.55)", marginTop: 2 },
  link: { color: COLORS.navy, fontSize: 12 },
  deleteText: { color: COLORS.danger, fontSize: 12 },
  label: { fontSize: 13, color: "rgba(20,24,33,0.7)", marginTop: 10, marginBottom: 6 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 40 },
});

export default StaffUsersScreen;
