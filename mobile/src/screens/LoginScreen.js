import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/format";

const IconInput = ({ icon, secure, toggleSecure, showToggle, ...props }) => (
  <View style={styles.inputWrap}>
    <Ionicons name={icon} size={18} color="rgba(36,19,23,0.4)" style={styles.inputIcon} />
    <TextInput style={styles.input} placeholderTextColor="#9CA3AF" secureTextEntry={secure} {...props} />
    {showToggle && (
      <TouchableOpacity onPress={toggleSecure} style={styles.eyeBtn}>
        <Ionicons name={secure ? "eye-outline" : "eye-off-outline"} size={18} color="rgba(36,19,23,0.4)" />
      </TouchableOpacity>
    )}
  </View>
);

const LoginScreen = () => {
  const { login, register, staffLogin } = useAuth();
  const [role, setRole] = useState("staff");
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (role === "staff") {
      if (!username.trim() || !password) {
        setError("Username iyo Password waa waajib.");
        return;
      }
      setLoading(true);
      try {
        await staffLogin(username.trim().toLowerCase(), password);
      } catch (err) {
        setError(err.response?.data?.message || "Login-ku wuu fashilmay.");
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!phone.trim() || !password) {
      setError("Phone iyo Password waa waajib.");
      return;
    }
    if (mode === "register" && password !== confirmPassword) {
      setError("Labada password iskuma eka.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "register") await register(phone.trim(), password);
      else await login(phone.trim(), password);
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroBlobLarge} />
          <View style={styles.heroBlobSmall} />
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>MT</Text>
          </View>
          <Text style={styles.title}>Maqaayda Taysiir</Text>
          <Text style={styles.subtitle}>Taysiir International Schools</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleTab, role === "staff" && styles.roleTabActive]}
              onPress={() => { setRole("staff"); setError(""); setPassword(""); }}
            >
              <Text style={[styles.roleText, role === "staff" && styles.roleTextActive]}>System Users</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleTab, role === "parent" && styles.roleTabActive]}
              onPress={() => { setRole("parent"); setError(""); setPassword(""); }}
            >
              <Text style={[styles.roleText, role === "parent" && styles.roleTextActive]}>Parents</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.welcome}>Ku Soo Dhawoow</Text>
          <Text style={styles.welcomeSub}>Gal xisaabtaada si aad u sii wadato.</Text>

          {role === "staff" ? (
            <>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Text style={styles.label}>Username</Text>
              <IconInput
                icon="person-outline"
                value={username}
                onChangeText={setUsername}
                placeholder="Geli username-kaaga"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.label}>Password</Text>
              <IconInput
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="Geli password-kaaga"
                secure={!showPassword}
                showToggle
                toggleSecure={() => setShowPassword((s) => !s)}
              />
              <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Soo Gal (Log In)</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.tabRow}>
                <TouchableOpacity style={[styles.tab, mode === "login" && styles.tabActive]} onPress={() => { setMode("login"); setError(""); }}>
                  <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>Soo Gal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, mode === "register" && styles.tabActive]} onPress={() => { setMode("register"); setError(""); }}>
                  <Text style={[styles.tabText, mode === "register" && styles.tabTextActive]}>Marka Koowaad</Text>
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}
              {mode === "register" && (
                <Text style={styles.note}>
                  Waxaad dhigaysaa password aad isticmaali doonto marar dambe. Lambarkaagu waa inuu horey ugu jiraa maqaayda.
                </Text>
              )}

              <Text style={styles.label}>Lambarka Telefoonka</Text>
              <IconInput
                icon="call-outline"
                value={phone}
                onChangeText={setPhone}
                placeholder="Lambarka aad maqaayda ku siisay"
                keyboardType="phone-pad"
                autoCapitalize="none"
              />

              <Text style={styles.label}>{mode === "register" ? "Samee Password" : "Password"}</Text>
              <IconInput
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="Geli password-kaaga"
                secure={!showPassword}
                showToggle
                toggleSecure={() => setShowPassword((s) => !s)}
              />

              {mode === "register" && (
                <>
                  <Text style={styles.label}>Xaqiiji Password</Text>
                  <IconInput
                    icon="lock-closed-outline"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Mar labaad geli password-ka"
                    secure={!showPassword}
                    showToggle
                    toggleSecure={() => setShowPassword((s) => !s)}
                  />
                </>
              )}

              <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{mode === "register" ? "Samee Xisaab" : "Soo Gal"}</Text>}
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.footer}>© {new Date().getFullYear()} Taysiir International School</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.navy },
  hero: {
    backgroundColor: COLORS.navy,
    paddingTop: 72,
    paddingBottom: 56,
    alignItems: "center",
    overflow: "hidden",
  },
  heroBlobLarge: { position: "absolute", top: -60, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.06)" },
  heroBlobSmall: { position: "absolute", bottom: -40, left: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.05)" },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.brand,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logoText: { color: "#fff", fontWeight: "700", fontSize: 20 },
  title: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  card: {
    backgroundColor: COLORS.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    flex: 1,
    padding: 24,
  },
  roleRow: { flexDirection: "row", backgroundColor: COLORS.surface, borderRadius: 999, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: COLORS.line },
  roleTab: { flex: 1, paddingVertical: 9, borderRadius: 999, alignItems: "center" },
  roleTabActive: { backgroundColor: COLORS.navy },
  roleText: { color: "rgba(36,19,23,0.5)", fontSize: 13, fontWeight: "600" },
  roleTextActive: { color: "#fff" },
  welcome: { fontSize: 20, fontWeight: "700", color: COLORS.ink },
  welcomeSub: { fontSize: 13, color: "rgba(36,19,23,0.5)", marginTop: 2, marginBottom: 16 },
  tabRow: { flexDirection: "row", backgroundColor: COLORS.surface, borderRadius: 999, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: COLORS.line },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: "center" },
  tabActive: { backgroundColor: COLORS.navy },
  tabText: { color: "rgba(36,19,23,0.5)", fontSize: 13, fontWeight: "500" },
  tabTextActive: { color: "#fff" },
  error: { backgroundColor: "rgba(194,65,45,0.1)", color: COLORS.danger, padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13 },
  note: { backgroundColor: "rgba(92,20,34,0.06)", color: "rgba(36,19,23,0.7)", padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 12 },
  label: { fontSize: 13, color: "rgba(36,19,23,0.7)", marginBottom: 4, marginTop: 10 },
  inputWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, backgroundColor: COLORS.surface, paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: COLORS.ink },
  eyeBtn: { padding: 4 },
  button: { backgroundColor: COLORS.brand, borderRadius: 999, paddingVertical: 13, alignItems: "center", marginTop: 22 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  footer: { textAlign: "center", color: "rgba(36,19,23,0.35)", fontSize: 11, marginTop: 20 },
});

export default LoginScreen;
