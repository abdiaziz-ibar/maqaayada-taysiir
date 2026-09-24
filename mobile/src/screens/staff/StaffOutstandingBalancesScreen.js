import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, ChipRow, Chip, Loading } from "../../components/UI";
import { COLORS, formatMoney } from "../../utils/format";

const FILTERS = [["all", "Dhammaan"], ["overdue", "Overdue"], ["partial", "Partial"], ["unpaid", "Unpaid"]];

const StaffOutstandingBalancesScreen = ({ navigation }) => {
  const [status, setStatus] = useState("all");
  const [rows, setRows] = useState(null);

  useEffect(() => {
    setRows(null);
    staffApi.get("/reports/outstanding-balances", { params: { status } }).then((res) => setRows(res.data.rows));
  }, [status]);

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Deymaha" onBack={() => navigation.goBack()} />
      <ChipRow>
        {FILTERS.map(([v, label]) => (
          <Chip key={v} label={label} active={status === v} onPress={() => setStatus(v)} />
        ))}
      </ChipRow>
      {!rows ? (
        <Loading />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => r.parent.id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          renderItem={({ item: r }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ParentDetail", { id: r.parent.id })}>
              <Text style={styles.name}>{r.parent.fullName}</Text>
              <Text style={styles.meta}>{r.parent.phone} · {r.childrenCount} arday</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.meta}>Bisha ugu da'da badan: {r.oldestUnpaidMonth || "-"}</Text>
                <Text style={styles.owed}>{formatMoney(r.outstanding)}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Ma jiraan deymo hadda jira.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, padding: 12, marginBottom: 8 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  name: { fontSize: 14, fontWeight: "600", color: COLORS.ink },
  meta: { fontSize: 12, color: "rgba(20,24,33,0.55)", marginTop: 2 },
  owed: { fontSize: 14, fontWeight: "700", color: COLORS.danger },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 40 },
});

export default StaffOutstandingBalancesScreen;
