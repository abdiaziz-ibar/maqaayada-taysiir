import { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import staffApi from "../../api/staffClient";
import { ScreenHeader, Field, PrimaryButton, ErrorText, SuccessText, Loading } from "../../components/UI";
import { COLORS } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

const StaffSettingsScreen = ({ navigation }) => {
  const { staff } = useAuth();
  const canEdit = staff?.role === "admin" || staff?.canManageFinance;
  const [schoolName, setSchoolName] = useState("");
  const [currency, setCurrency] = useState("");
  const [occasionalMealPrice, setOccasionalMealPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    staffApi.get("/settings").then((res) => {
      setSchoolName(res.data.settings.schoolName);
      setCurrency(res.data.settings.currency);
      setOccasionalMealPrice(String(res.data.settings.occasionalMealPrice));
    }).finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    setError(""); setMessage("");
    setSaving(true);
    try {
      await staffApi.put("/settings", { schoolName, currency, occasionalMealPrice: Number(occasionalMealPrice) });
      setMessage("Dejinta waa la kaydiyay.");
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Dejinta" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14 }}>
        <ErrorText text={error} />
        <SuccessText text={message} />
        <Field label="Magaca Dugsiga" value={schoolName} onChangeText={setSchoolName} editable={canEdit} />
        <Field label="Lambiga Lacagta" value={currency} onChangeText={setCurrency} editable={canEdit} />
        <Field label="Qiimaha Cunto Mar-mar ah" value={occasionalMealPrice} onChangeText={setOccasionalMealPrice} keyboardType="numeric" editable={canEdit} />
        {canEdit && <PrimaryButton title={saving ? "..." : "Kaydi"} onPress={submit} loading={saving} />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.paper },
});

export default StaffSettingsScreen;
