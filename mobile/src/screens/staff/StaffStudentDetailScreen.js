import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, Card, InfoRow, Loading, Badge } from "../../components/UI";
import { COLORS, formatMoney, formatDate, monthLabel, invoiceStatusLabel, invoiceStatusColor, mealTypeLabel, attendanceStatusLabel, attendanceStatusColor } from "../../utils/format";

const StaffStudentDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    staffApi.get(`/students/${id}`).then((res) => setStudent(res.data.student));
    staffApi.get(`/reports/student-meal-history/${id}`).then((res) => setHistory(res.data));
  }, [id]);

  if (!student) return <Loading />;

  return (
    <View style={styles.flex}>
      <ScreenHeader title={student.fullName} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
        <Card>
          <InfoRow label="Code" value={student.studentCode} />
          <InfoRow label="Fasalka" value={student.class?.name} />
          <InfoRow label="Waalidka" value={`${student.parent?.fullName} (${student.parent?.phone})`} />
          <InfoRow label="Meal Plan" value={student.mealPlan?.name || "Mar-mar oo kaliya"} />
        </Card>

        {history && (
          <Card>
            <Text style={styles.sectionTitle}>Falanqaynta Cuntada</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}><Text style={styles.statValue}>{history.summary.totalExpected}</Text><Text style={styles.statLabel}>La Filayay</Text></View>
              <View style={styles.statBox}><Text style={[styles.statValue, { color: COLORS.success }]}>{history.summary.totalEaten}</Text><Text style={styles.statLabel}>Cunay</Text></View>
              <View style={styles.statBox}><Text style={[styles.statValue, { color: COLORS.danger }]}>{history.summary.totalMissed}</Text><Text style={styles.statLabel}>Ma Cunin</Text></View>
              <View style={styles.statBox}><Text style={styles.statValue}>{history.summary.attendancePercentage}%</Text><Text style={styles.statLabel}>Boqolkiiba</Text></View>
            </View>
          </Card>
        )}

        <Text style={styles.sectionTitle}>Invoices</Text>
        {student.invoices?.map((inv) => (
          <Card key={inv.id}>
            <View style={styles.rowBetween}>
              <Text style={styles.invLine}>{monthLabel(inv.month)} {inv.year}</Text>
              <Badge text={invoiceStatusLabel(inv.status)} color={invoiceStatusColor(inv.status)} />
            </View>
            <InfoRow label="La Rabo" value={formatMoney(inv.amountDue)} />
            <InfoRow label="La Bixiyey" value={formatMoney(inv.amountPaid)} />
          </Card>
        ))}
        {(!student.invoices || student.invoices.length === 0) && <Text style={styles.empty}>Weli invoice lama dhigin.</Text>}

        <Text style={styles.sectionTitle}>Taariikhda Cuntada (10-kii ugu dambeeyay)</Text>
        {history?.attendances.slice(0, 10).map((a) => (
          <View key={a.id} style={styles.attRow}>
            <Text style={styles.attDate}>{formatDate(a.date)}</Text>
            <Text style={styles.attMeal}>{mealTypeLabel(a.mealType)}</Text>
            <Badge text={attendanceStatusLabel(a.status)} color={attendanceStatusColor(a.status)} />
          </View>
        ))}
        {history && history.attendances.length === 0 && <Text style={styles.empty}>Weli xog cunto lama diiwaan gelin.</Text>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  sectionTitle: { fontSize: 13, color: "rgba(20,24,33,0.5)", textTransform: "uppercase", marginBottom: 8, marginTop: 6 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  invLine: { fontSize: 14, fontWeight: "600", color: COLORS.ink },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statBox: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 18, fontWeight: "700", color: COLORS.ink },
  statLabel: { fontSize: 10, color: "rgba(20,24,33,0.5)", marginTop: 2, textAlign: "center" },
  attRow: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 8, borderWidth: 1, borderColor: COLORS.line, padding: 10, marginBottom: 6, gap: 8 },
  attDate: { fontSize: 12, color: COLORS.ink, width: 80 },
  attMeal: { fontSize: 12, color: "rgba(20,24,33,0.6)", flex: 1 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginBottom: 12 },
});

export default StaffStudentDetailScreen;
