import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, Field, Loading } from "../../components/UI";
import { COLORS } from "../../utils/format";

const StaffStudentsScreen = ({ navigation }) => {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await staffApi.get("/students", { params: search ? { search } : {} });
      setStudents(res.data.students);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Ardayda" onBack={() => navigation.goBack()} />
      <View style={{ padding: 14, paddingBottom: 0 }}>
        <Field placeholder="Raadi magac ama code..." value={search} onChangeText={setSearch} />
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
              <Text style={styles.name}>{s.fullName}</Text>
              <Text style={styles.meta}>
                {s.studentCode} · {s.class?.name || "-"} · {s.parent?.fullName}
              </Text>
              <Text style={styles.meta}>{s.mealPlan?.name || "Mar-mar oo kaliya"}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Arday lama helin.</Text>}
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

export default StaffStudentsScreen;
