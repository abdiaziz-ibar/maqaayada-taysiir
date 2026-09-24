import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, ScreenModal, Field, PrimaryButton, ErrorText, ChipRow, Chip, Loading } from "../../components/UI";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { COLORS } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

const StudentModal = ({ visible, onClose, onSaved, editing }) => {
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [mealPlanId, setMealPlanId] = useState("");
  const [classes, setClasses] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [parentMode, setParentMode] = useState("existing");
  const [parentSearch, setParentSearch] = useState("");
  const [parentOptions, setParentOptions] = useState([]);
  const [parentId, setParentId] = useState("");
  const [newParentName, setNewParentName] = useState("");
  const [newParentPhone, setNewParentPhone] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    staffApi.get("/classes").then((res) => setClasses(res.data.classes));
    staffApi.get("/meal-plans").then((res) => setMealPlans(res.data.mealPlans));
    if (editing) {
      setFullName(editing.fullName);
      setGender(editing.gender || "");
      setClassId(editing.classId || "");
      setSectionId(editing.sectionId || "");
      setMealPlanId(editing.mealPlanId || "");
      setParentId(editing.parentId || "");
    } else {
      setFullName(""); setGender(""); setClassId(""); setSectionId(""); setMealPlanId("");
      setParentId(""); setNewParentName(""); setNewParentPhone(""); setParentSearch(""); setParentMode("existing");
    }
    setError("");
  }, [visible, editing]);

  useEffect(() => {
    if (!visible || parentMode !== "existing") return;
    const t = setTimeout(() => {
      staffApi.get("/parents", { params: parentSearch ? { search: parentSearch } : {} }).then((res) => setParentOptions(res.data.parents));
    }, 250);
    return () => clearTimeout(t);
  }, [visible, parentMode, parentSearch]);

  const selectedClass = classes.find((c) => c.id === classId);

  const submit = async () => {
    setError("");
    if (!fullName.trim()) return setError("Magaca ardayga waa waajib.");
    setSaving(true);
    try {
      const payload = {
        fullName,
        gender: gender || undefined,
        classId: classId || null,
        sectionId: sectionId || null,
        mealPlanId: mealPlanId || null,
      };
      if (editing) {
        if (parentId) payload.parentId = parentId;
        await staffApi.put(`/students/${editing._id}`, payload);
      } else {
        if (parentMode === "existing") {
          if (!parentId) { setError("Fadlan dooro waalid."); setSaving(false); return; }
          payload.parentId = parentId;
        } else {
          if (!newParentName.trim() || !newParentPhone.trim()) { setError("Magaca iyo telefoonka waalidka waa waajib."); setSaving(false); return; }
          payload.newParent = { fullName: newParentName, phone: newParentPhone };
        }
        await staffApi.post("/students", payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenModal visible={visible} title={editing ? "Wax Ka Beddel Ardayga" : "Arday Cusub"} onClose={onClose}>
      <ErrorText text={error} />
      <Field label="Magaca Ardayga" value={fullName} onChangeText={setFullName} />

      <Text style={styles.label}>Jinsiga</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[["male", "Male"], ["female", "Female"]].map(([v, l]) => (
          <Chip key={v} label={l} active={gender === v} onPress={() => setGender(gender === v ? "" : v)} />
        ))}
      </View>

      <Text style={styles.label}>Fasalka</Text>
      <ChipRow>
        {classes.map((c) => (
          <Chip key={c.id} label={c.name} active={classId === c.id} onPress={() => { setClassId(classId === c.id ? "" : c.id); setSectionId(""); }} />
        ))}
      </ChipRow>

      {!!selectedClass?.sections?.length && (
        <>
          <Text style={styles.label}>Qaybta (Section)</Text>
          <ChipRow>
            {selectedClass.sections.map((s) => (
              <Chip key={s.id} label={s.name} active={sectionId === s.id} onPress={() => setSectionId(sectionId === s.id ? "" : s.id)} />
            ))}
          </ChipRow>
        </>
      )}

      <Text style={styles.label}>Meal Plan (haddii uu joogto ku qorayo cuntada)</Text>
      <ChipRow>
        {mealPlans.map((p) => (
          <Chip key={p.id} label={`${p.name} — $${p.monthlyPrice}`} active={mealPlanId === p.id} onPress={() => setMealPlanId(mealPlanId === p.id ? "" : p.id)} />
        ))}
      </ChipRow>

      {!editing && (
        <View style={styles.toggleRow}>
          <TouchableOpacity style={[styles.toggleBtn, parentMode === "existing" && styles.toggleBtnActive]} onPress={() => setParentMode("existing")}>
            <Text style={[styles.toggleText, parentMode === "existing" && styles.toggleTextActive]}>Waalid Jira</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleBtn, parentMode === "new" && styles.toggleBtnActive]} onPress={() => setParentMode("new")}>
            <Text style={[styles.toggleText, parentMode === "new" && styles.toggleTextActive]}>Waalid Cusub</Text>
          </TouchableOpacity>
        </View>
      )}

      {(editing || parentMode === "existing") ? (
        <>
          <Field label={editing ? "Beddel Waalidka (ikhtiyaari)" : "Raadi Waalid"} value={parentSearch} onChangeText={setParentSearch} placeholder="Raadi waalid..." />
          <ChipRow>
            {parentOptions.map((p) => (
              <Chip key={p._id} label={`${p.fullName} (${p.phone})`} active={parentId === p._id} onPress={() => setParentId(p._id)} />
            ))}
          </ChipRow>
        </>
      ) : (
        <>
          <Field label="Magaca Waalidka" value={newParentName} onChangeText={setNewParentName} />
          <Field label="Telefoonka" value={newParentPhone} onChangeText={setNewParentPhone} keyboardType="phone-pad" />
        </>
      )}

      <PrimaryButton title={saving ? "..." : "Kaydi"} onPress={submit} loading={saving} />
    </ScreenModal>
  );
};

const StaffStudentsScreen = ({ navigation }) => {
  const { staff } = useAuth();
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    const res = await staffApi.get("/students", { params: search ? { search } : {} });
    setStudents(res.data.students);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => { load(); }, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Ardayda" onBack={() => navigation.goBack()} />
      <View style={{ padding: 14, paddingBottom: 0 }}>
        <Field placeholder="Raadi magac ama code..." value={search} onChangeText={setSearch} />
        <PrimaryButton title="+ Arday Cusub" onPress={() => { setEditing(null); setShowAdd(true); }} />
      </View>
      {!students ? (
        <Loading />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(s) => s._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          renderItem={({ item: s }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("StudentDetail", { id: s._id })}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{s.fullName}</Text>
                  <Text style={styles.meta}>
                    {s.studentCode} · {s.class?.name || "-"} · {s.parent?.fullName}
                  </Text>
                  <Text style={styles.meta}>{s.mealPlan?.name || "Mar-mar oo kaliya"}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 14 }}>
                  <TouchableOpacity onPress={(e) => { e.stopPropagation(); setEditing(s); setShowAdd(true); }}>
                    <Text style={styles.editText}>Wax ka beddel</Text>
                  </TouchableOpacity>
                  {staff?.role === "admin" && (
                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); setDeleting(s); }}>
                      <Text style={styles.deleteText}>Tirtir</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Arday lama helin.</Text>}
        />
      )}
      <StudentModal visible={showAdd} onClose={() => setShowAdd(false)} onSaved={load} editing={editing} />
      <ConfirmDeleteModal
        visible={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await staffApi.delete(`/students/${deleting._id}`); load(); }}
        title="Tirtir Ardayga"
        description={deleting ? `Ma hubtaa inaad tirtirayso "${deleting.fullName}"? Waxaa la tirtiri doonaa dhammaan invoice-yadiisa iyo xogta cuntada.` : ""}
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
  label: { fontSize: 13, color: "rgba(20,24,33,0.7)", marginBottom: 4, marginTop: 12 },
  toggleRow: { flexDirection: "row", gap: 8, backgroundColor: COLORS.paper, borderRadius: 999, padding: 4, marginTop: 12 },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: "center" },
  toggleBtnActive: { backgroundColor: COLORS.surface },
  toggleText: { fontSize: 12, color: "rgba(20,24,33,0.5)" },
  toggleTextActive: { color: COLORS.ink, fontWeight: "600" },
});

export default StaffStudentsScreen;
