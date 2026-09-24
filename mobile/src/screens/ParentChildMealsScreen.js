import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import api from "../api/client";
import { ScreenHeader, Badge, Loading } from "../components/UI";
import { COLORS, formatDate, mealTypeLabel, attendanceStatusLabel, attendanceStatusColor } from "../utils/format";

const ParentChildMealsScreen = ({ route, navigation }) => {
  const { id, name } = route.params;
  const [attendances, setAttendances] = useState(null);

  useEffect(() => {
    api.get(`/parent-portal/students/${id}/meals`).then((res) => setAttendances(res.data.attendances));
  }, [id]);

  if (!attendances) return <Loading />;

  return (
    <View style={styles.flex}>
      <ScreenHeader title={name} onBack={() => navigation.goBack()} />
      <FlatList
        data={attendances}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        renderItem={({ item: a }) => (
          <View style={styles.row}>
            <Text style={styles.date}>{formatDate(a.date)}</Text>
            <Text style={styles.meal}>{mealTypeLabel(a.mealType)}</Text>
            <Badge text={attendanceStatusLabel(a.status)} color={attendanceStatusColor(a.status)} />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Weli xog cunto lama diiwaan gelin.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.line, padding: 12, marginBottom: 8, gap: 10 },
  date: { fontSize: 13, color: COLORS.ink, width: 90 },
  meal: { fontSize: 13, color: "rgba(20,24,33,0.6)", flex: 1 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginTop: 40 },
});

export default ParentChildMealsScreen;
