import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, RefreshControl } from "react-native";
import staffApi from "../../api/staffClient";
import { StaffHeader, ChipRow, Chip, Loading } from "../../components/UI";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { COLORS, todayIso, mealTypeLabel, formatDate } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];
const TABS = [["roster", "Diiwaan Geli"], ["who-ate", "Kuwa Cunay"], ["who-did-not-eat", "Kuwa Aan Cunin"]];

const RosterRow = ({ row, onMark, marking, onReset, canReset }) => (
  <View style={styles.row}>
    <View style={{ flex: 1 }}>
      <Text style={styles.name}>{row.fullName}</Text>
      <Text style={styles.meta}>{row.studentCode}{row.className ? ` · ${row.className}` : ""}</Text>
    </View>
    <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
      <TouchableOpacity
        style={[styles.mealBtn, { backgroundColor: row.status === "ate" ? COLORS.success : `${COLORS.success}33` }]}
        onPress={() => onMark(row.studentId, true)}
        disabled={marking === row.studentId}
      >
        <Text style={styles.mealBtnText}>CUNAY</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.mealBtn, { backgroundColor: row.status === "did_not_eat" ? COLORS.danger : `${COLORS.danger}33` }]}
        onPress={() => onMark(row.studentId, false)}
        disabled={marking === row.studentId}
      >
        <Text style={styles.mealBtnText}>MA CUNIN</Text>
      </TouchableOpacity>
      {canReset && row.recordId && (
        <TouchableOpacity onPress={() => onReset(row)} style={styles.resetBtn}>
          <Text style={styles.resetText}>↺</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const StaffAttendanceScreen = () => {
  const { staff } = useAuth();
  const [date, setDate] = useState(todayIso());
  const [mealType, setMealType] = useState("lunch");
  const [tab, setTab] = useState("roster");
  const [roster, setRoster] = useState(null);
  const [reportRows, setReportRows] = useState(null);
  const [marking, setMarking] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadRoster = useCallback(async () => {
    const res = await staffApi.get("/attendance", { params: { date, mealType } });
    setRoster(res.data.roster);
  }, [date, mealType]);

  const loadReport = useCallback(async (which) => {
    const res = await staffApi.get(`/attendance/${which}`, { params: { date, mealType } });
    setReportRows(res.data.records);
  }, [date, mealType]);

  useEffect(() => {
    if (tab === "roster") loadRoster();
    else loadReport(tab);
  }, [tab, loadRoster, loadReport]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (tab === "roster") await loadRoster();
    else await loadReport(tab);
    setRefreshing(false);
  };

  const mark = async (studentId, ate) => {
    setMarking(studentId);
    try {
      await staffApi.put(`/attendance/${studentId}`, { date, mealType, ate });
      await loadRoster();
    } finally {
      setMarking(null);
    }
  };

  return (
    <View style={styles.flex}>
      <StaffHeader title="Cuntada Maalinlaha" />
      <View style={styles.filters}>
        <TextInput style={styles.dateInput} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <TouchableOpacity style={styles.todayBtn} onPress={() => setDate(todayIso())}>
          <Text style={styles.todayBtnText}>Maanta</Text>
        </TouchableOpacity>
      </View>
      <ChipRow>
        {MEAL_TYPES.map((t) => (
          <Chip key={t} label={mealTypeLabel(t)} active={mealType === t} onPress={() => setMealType(t)} />
        ))}
      </ChipRow>
      <View style={styles.tabRow}>
        {TABS.map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.tab, tab === key && styles.tabActive]} onPress={() => setTab(key)}>
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "roster" ? (
        !roster ? <Loading /> : (
          <FlatList
            data={roster}
            keyExtractor={(r) => r.studentId}
            contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
              <RosterRow row={item} onMark={mark} marking={marking} onReset={setResetting} canReset={staff?.role === "admin"} />
            )}
            ListEmptyComponent={<Text style={styles.empty}>Arday la sugayo lama helin ({mealTypeLabel(mealType)}-ka).</Text>}
          />
        )
      ) : (
        !reportRows ? <Loading /> : (
          <FlatList
            data={reportRows}
            keyExtractor={(r) => r.id}
            contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item: r }) => (
              <View style={styles.reportRow}>
                <Text style={styles.name}>{r.student.fullName}</Text>
                <Text style={styles.meta}>{formatDate(r.date)} · {r.student.class?.name || "-"} · {r.student.parent?.fullName}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Wax lama helin.</Text>}
          />
        )
      )}

      <ConfirmDeleteModal
        visible={!!resetting}
        onClose={() => setResetting(null)}
        onConfirm={async () => { await staffApi.delete(`/attendance/record/${resetting.recordId}`); loadRoster(); }}
        title="Tirtir Diiwaanka"
        description={resetting ? `Ma hubtaa inaad tirtirayso diiwaanka "${resetting.fullName}"?` : ""}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  filters: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: 12, gap: 8 },
  dateInput: { flex: 1, borderWidth: 1, borderColor: COLORS.line, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.surface, fontSize: 14 },
  todayBtn: { backgroundColor: COLORS.navy, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  todayBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  tabRow: { flexDirection: "row", backgroundColor: COLORS.paper, paddingHorizontal: 14, gap: 6, paddingTop: 8 },
  tab: { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 999, paddingVertical: 7, alignItems: "center" },
  tabActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  tabText: { fontSize: 11, color: COLORS.ink },
  tabTextActive: { color: "#fff", fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, padding: 12, marginBottom: 10, gap: 8 },
  reportRow: { backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.line, padding: 12, marginBottom: 8 },
  name: { fontSize: 15, fontWeight: "600", color: COLORS.ink },
  meta: { fontSize: 12, color: "rgba(20,24,33,0.5)", marginTop: 2 },
  mealBtn: { paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8 },
  mealBtnText: { color: "#fff", fontWeight: "700", fontSize: 11 },
  resetBtn: { padding: 6 },
  resetText: { fontSize: 16, color: "rgba(20,24,33,0.4)" },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 40 },
});

export default StaffAttendanceScreen;
