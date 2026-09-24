import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, RefreshControl } from "react-native";
import staffApi from "../../api/staffClient";
import { StaffHeader, ChipRow, Chip, Loading } from "../../components/UI";
import { COLORS, todayIso, mealTypeLabel } from "../../utils/format";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

const RosterRow = ({ row, onMark, marking }) => (
  <View style={styles.row}>
    <View style={{ flex: 1 }}>
      <Text style={styles.name}>{row.fullName}</Text>
      <Text style={styles.meta}>{row.studentCode}{row.className ? ` · ${row.className}` : ""}</Text>
    </View>
    <View style={{ flexDirection: "row", gap: 8 }}>
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
    </View>
  </View>
);

const StaffAttendanceScreen = () => {
  const [date, setDate] = useState(todayIso());
  const [mealType, setMealType] = useState("lunch");
  const [roster, setRoster] = useState(null);
  const [marking, setMarking] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await staffApi.get("/attendance", { params: { date, mealType } });
    setRoster(res.data.roster);
  }, [date, mealType]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const mark = async (studentId, ate) => {
    setMarking(studentId);
    try {
      await staffApi.put(`/attendance/${studentId}`, { date, mealType, ate });
      await load();
    } finally {
      setMarking(null);
    }
  };

  return (
    <View style={styles.flex}>
      <StaffHeader title="Cuntada Maalinlaha" />
      <View style={styles.filters}>
        <TextInput
          style={styles.dateInput}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
        />
        <TouchableOpacity style={styles.todayBtn} onPress={() => setDate(todayIso())}>
          <Text style={styles.todayBtnText}>Maanta</Text>
        </TouchableOpacity>
      </View>
      <ChipRow>
        {MEAL_TYPES.map((t) => (
          <Chip key={t} label={mealTypeLabel(t)} active={mealType === t} onPress={() => setMealType(t)} />
        ))}
      </ChipRow>

      {!roster ? (
        <Loading />
      ) : (
        <FlatList
          data={roster}
          keyExtractor={(r) => r.studentId}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => <RosterRow row={item} onMark={mark} marking={marking} />}
          ListEmptyComponent={<Text style={styles.empty}>Arday la sugayo lama helin ({mealTypeLabel(mealType)}-ka).</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  filters: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: 12, gap: 8 },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    fontSize: 14,
  },
  todayBtn: { backgroundColor: COLORS.navy, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  todayBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  name: { fontSize: 15, fontWeight: "600", color: COLORS.ink },
  meta: { fontSize: 12, color: "rgba(20,24,33,0.5)", marginTop: 2 },
  mealBtn: { paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8 },
  mealBtnText: { color: "#fff", fontWeight: "700", fontSize: 11 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 40 },
});

export default StaffAttendanceScreen;
