import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, Field, Loading } from "../../components/UI";
import { COLORS } from "../../utils/format";

const StaffParentsScreen = ({ navigation }) => {
  const [search, setSearch] = useState("");
  const [parents, setParents] = useState(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await staffApi.get("/parents", { params: search ? { search } : {} });
      setParents(res.data.parents);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Waalidiinta" onBack={() => navigation.goBack()} />
      <View style={{ padding: 14, paddingBottom: 0 }}>
        <Field placeholder="Raadi magac ama telefoon..." value={search} onChangeText={setSearch} />
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
              <Text style={styles.name}>{p.fullName}</Text>
              <Text style={styles.meta}>{p.parentCode} · {p.phone}</Text>
              <Text style={styles.meta}>{p.students?.map((s) => s.fullName).join(", ") || "-"}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Waalid lama helin.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, padding: 12, marginBottom: 8 },
  name: { fontSize: 15, fontWeight: "600", color: COLORS.ink },
  meta: { fontSize: 12, color: "rgba(20,24,33,0.55)", marginTop: 2 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 40 },
});

export default StaffParentsScreen;
