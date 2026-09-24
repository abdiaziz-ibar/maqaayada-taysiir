import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, ScreenModal, Field, PrimaryButton, ErrorText, SuccessText, Card, Chip } from "../../components/UI";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { COLORS, formatDate, formatMoney, monthLabel } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

const ADJUSTMENT_TYPES = ["full", "half", "custom", "none"];

const AddHolidayModal = ({ visible, onClose, onSaved }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError("");
    if (!name.trim() || !startDate || !endDate) return setError("Dhammaan beeraha waa waajib.");
    setSaving(true);
    try {
      await staffApi.post("/holidays", { name, startDate, endDate, type: "school" });
      setName(""); setStartDate(""); setEndDate("");
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenModal visible={visible} title="Fasax Cusub" onClose={onClose}>
      <ErrorText text={error} />
      <Field label="Magaca Fasaxa" value={name} onChangeText={setName} />
      <Field label="Bilowga (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} placeholder="2026-12-15" />
      <Field label="Dhammaadka (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} placeholder="2026-12-31" />
      <PrimaryButton title={saving ? "..." : "Kaydi"} onPress={submit} loading={saving} />
    </ScreenModal>
  );
};

const StaffHolidaysScreen = ({ navigation }) => {
  const { staff } = useAuth();
  const isAdmin = staff?.role === "admin" || staff?.canManageFinance;
  const [holidays, setHolidays] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [adjType, setAdjType] = useState("half");
  const [customAmount, setCustomAmount] = useState("");
  const [adjError, setAdjError] = useState("");
  const [adjMessage, setAdjMessage] = useState("");
  const [adjSaving, setAdjSaving] = useState(false);

  const load = useCallback(async () => {
    const [h, a] = await Promise.all([staffApi.get("/holidays"), staffApi.get("/fee-adjustments")]);
    setHolidays(h.data.holidays);
    setAdjustments(a.data.feeAdjustments);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveAdjustment = async () => {
    setAdjError(""); setAdjMessage("");
    setAdjSaving(true);
    try {
      await staffApi.post("/fee-adjustments", {
        year: Number(year), month, adjustmentType: adjType,
        customAmount: adjType === "custom" ? Number(customAmount) : undefined,
      });
      setAdjMessage("Beddelka lacagta waa la kaydiyay.");
      load();
    } catch (err) {
      setAdjError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setAdjSaving(false);
    }
  };

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Fasaxyada & Lacagta" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
        <PrimaryButton title="+ Fasax Cusub" onPress={() => setShowAdd(true)} />
        {holidays.map((h) => (
          <Card key={h.id}>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{h.name}</Text>
              {staff?.role === "admin" && (
                <TouchableOpacity onPress={() => setDeleting(h)}><Text style={styles.deleteText}>Tirtir</Text></TouchableOpacity>
              )}
            </View>
            <Text style={styles.meta}>{formatDate(h.startDate)} - {formatDate(h.endDate)}</Text>
          </Card>
        ))}
        {holidays.length === 0 && <Text style={styles.empty}>Fasax lama helin.</Text>}

        {isAdmin && (
          <>
            <Text style={styles.sectionTitle}>Beddelka Lacagta Bille</Text>
            <Card>
              <ErrorText text={adjError} />
              <SuccessText text={adjMessage} />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Field style={{ flex: 1 }} label="Bil (1-12)" value={String(month)} onChangeText={(v) => setMonth(Number(v) || 1)} keyboardType="numeric" />
                <Field style={{ flex: 1 }} label="Sanad" value={year} onChangeText={setYear} keyboardType="numeric" />
              </View>
              <Text style={styles.label}>Nooca Beddelka</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {ADJUSTMENT_TYPES.map((t) => (
                  <Chip key={t} label={t} active={adjType === t} onPress={() => setAdjType(t)} />
                ))}
              </View>
              {adjType === "custom" && <Field label="Qadarka Gaarka ah" value={customAmount} onChangeText={setCustomAmount} keyboardType="numeric" />}
              <PrimaryButton title={adjSaving ? "..." : "Kaydi Beddelka"} onPress={saveAdjustment} loading={adjSaving} />
            </Card>

            <Text style={styles.sectionTitle}>Beddelada Jira</Text>
            {adjustments.map((a) => (
              <Card key={a.id}>
                <Text style={styles.name}>{monthLabel(a.month)} {a.year} — {a.adjustmentType}{a.adjustmentType === "custom" ? ` (${formatMoney(a.customAmount)})` : ""}</Text>
                <Text style={styles.meta}>{a.mealPlan?.name || "Dhammaan Meal Plans"}</Text>
              </Card>
            ))}
            {adjustments.length === 0 && <Text style={styles.empty}>Beddel lama dejin.</Text>}
          </>
        )}
      </ScrollView>
      <AddHolidayModal visible={showAdd} onClose={() => setShowAdd(false)} onSaved={load} />
      <ConfirmDeleteModal
        visible={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await staffApi.delete(`/holidays/${deleting.id}`); load(); }}
        title="Tirtir Fasaxa"
        description={deleting ? `Ma hubtaa inaad tirtirayso "${deleting.name}"?` : ""}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 14, fontWeight: "600", color: COLORS.ink },
  meta: { fontSize: 12, color: "rgba(20,24,33,0.55)", marginTop: 2 },
  deleteText: { color: COLORS.danger, fontSize: 13 },
  sectionTitle: { fontSize: 13, color: "rgba(20,24,33,0.5)", textTransform: "uppercase", marginTop: 16, marginBottom: 8 },
  label: { fontSize: 13, color: "rgba(20,24,33,0.7)", marginTop: 10, marginBottom: 6 },
  empty: { textAlign: "center", color: "rgba(20,24,33,0.4)", marginVertical: 8 },
});

export default StaffHolidaysScreen;
