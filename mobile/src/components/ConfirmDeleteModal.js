import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import staffApi from "../api/staffClient";
import { ScreenModal, Field, PrimaryButton, ErrorText } from "./UI";
import { COLORS } from "../utils/format";

// Mirrors the web app's step-up confirmation: the admin re-enters their own
// password (verified against /auth/verify-password) before the delete
// actually fires. Delete endpoints are also admin-only on the backend;
// this is the UX speed bump against a session left open.
const ConfirmDeleteModal = ({ visible, onClose, onConfirm, title, description }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      await staffApi.post("/auth/verify-password", { password });
      await onConfirm();
      setPassword("");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenModal visible={visible} title={title || "Tirtir"} onClose={onClose}>
      <View style={styles.warnBox}>
        <Text style={styles.warnText}>{description || "Ficilkan lama soo celin karo."}</Text>
      </View>
      <ErrorText text={error} />
      <Field label="Geli Password-kaaga (Admin) si aad u xaqiijiso" value={password} onChangeText={setPassword} secureTextEntry />
      <PrimaryButton title={loading ? "..." : "Xaqiiji oo Tirtir"} onPress={submit} loading={loading} color={COLORS.danger} />
    </ScreenModal>
  );
};

const styles = StyleSheet.create({
  warnBox: { backgroundColor: "rgba(179,64,42,0.08)", borderRadius: 8, padding: 10, marginBottom: 6 },
  warnText: { color: COLORS.danger, fontSize: 13 },
});

export default ConfirmDeleteModal;
