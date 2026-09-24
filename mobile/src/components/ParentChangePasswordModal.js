import { useState } from "react";
import api from "../api/client";
import { ScreenModal, Field, PrimaryButton, ErrorText, SuccessText } from "./UI";

const ParentChangePasswordModal = ({ visible, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/parent-portal/change-password", { currentPassword, newPassword });
      setMessage(res.data.message);
      setCurrentPassword(""); setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenModal visible={visible} title="Beddel Password" onClose={onClose}>
      <ErrorText text={error} />
      <SuccessText text={message} />
      <Field label="Password-ka Hadda" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
      <Field label="Password-ka Cusub" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
      <PrimaryButton title={loading ? "..." : "Beddel"} onPress={submit} loading={loading} />
    </ScreenModal>
  );
};

export default ParentChangePasswordModal;
