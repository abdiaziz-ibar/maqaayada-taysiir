import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, Loading } from "../../components/UI";
import { COLORS, formatDate } from "../../utils/format";

const StaffAuditLogsScreen = ({ navigation }) => {
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    staffApi.get("/audit-logs").then((res) => setLogs(res.data.logs));
  }, []);

  if (!logs) return <Loading />;

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Audit Logs" onBack={() => navigation.goBack()} />
      <FlatList
        data={logs}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        renderItem={({ item: l }) => (
          <View style={styles.row}>
            <Text style={styles.action}>{l.action} — {l.module}</Text>
            <Text style={styles.meta}>{l.user?.fullName || "System"} · {formatDate(l.createdAt)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Weli wax lama diiwaan gelin.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  row: { backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.line, padding: 12, marginBottom: 8 },
  action: { fontSize: 13, fontWeight: "600", color: COLORS.ink, textTransform: "capitalize" },
  meta: { fontSize: 11, color: "rgba(20,24,33,0.5)", marginTop: 2 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 40 },
});

export default StaffAuditLogsScreen;
