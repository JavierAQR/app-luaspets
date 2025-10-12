import { API } from "@/constants/api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";

export default function RecoverPasswordScreen() {
  const [step, setStep] = useState<"email" | "code">("email");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();

  const handleSendCode = async () => {
    if (!email) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await API.post("/auth/recover-password", { email });
      setSuccessMessage("Código enviado a tu correo");
      setTimeout(() => {
        setStep("code");
        setSuccessMessage("");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al enviar el código");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await API.post("/auth/reset-password", {
        email,
        code,
        newPassword,
      });
      setSuccessMessage("¡Contraseña actualizada correctamente!");
      setTimeout(() => {
        router.replace("/(auth)");
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al restablecer la contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCode("");
    setError("");
    await handleSendCode();
  };

  return (
    <ImageBackground
      source={require("../../assets/bg-patas.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {step === "email" ? "Recuperar Contraseña" : "Verificar Código"}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {step === "email" ? (
              <>
                <Text style={styles.instructionText}>
                  Ingresa tu correo electrónico y te enviaremos un código de
                  verificación para restablecer tu contraseña.
                </Text>

                <TextInput
                  placeholder="Correo electrónico"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}
                {successMessage ? (
                  <Text style={styles.success}>{successMessage}</Text>
                ) : null}

                <Button
                  mode="contained"
                  onPress={handleSendCode}
                  loading={loading}
                  disabled={loading}
                  style={styles.mainButton}
                  labelStyle={styles.buttonLabel}
                >
                  Enviar código
                </Button>
              </>
            ) : (
              <>
                <Text style={styles.instructionText}>
                  Ingresa el código de 6 dígitos que enviamos a{"\n"}
                  <Text style={styles.emailText}>{email}</Text>
                </Text>

                <TextInput
                  placeholder="Código de verificación"
                  placeholderTextColor="#999"
                  value={code}
                  onChangeText={setCode}
                  style={styles.input}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                />

                <TextInput
                  placeholder="Nueva contraseña"
                  placeholderTextColor="#999"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />

                <TextInput
                  placeholder="Confirmar nueva contraseña"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}
                {successMessage ? (
                  <Text style={styles.success}>{successMessage}</Text>
                ) : null}

                <Button
                  mode="contained"
                  onPress={handleResetPassword}
                  loading={loading}
                  disabled={loading}
                  style={styles.mainButton}
                  labelStyle={styles.buttonLabel}
                >
                  Restablecer contraseña
                </Button>

                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={loading}
                  style={{ marginTop: 15 }}
                >
                  <Text style={styles.resendText}>
                    ¿No recibiste el código? Reenviar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setStep("email");
                    setError("");
                  }}
                  disabled={loading}
                  style={{ marginTop: 10 }}
                >
                  <Text style={styles.changeEmailText}>
                    Cambiar correo electrónico
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  logo: {
    width: 220,
    height: 160,
    marginBottom: 20,
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 30,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    backgroundColor: "#f8f8f8",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: "#c568f2",
    fontSize: 15,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  instructionText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  emailText: {
    fontWeight: "700",
    color: "#c568f2",
  },
  input: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 15,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  mainButton: {
    backgroundColor: "#c568f2",
    borderRadius: 50,
    marginTop: 20,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: "#c568f2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  error: {
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  success: {
    color: "#27ae60",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  resendText: {
    textAlign: "center",
    color: "#c568f2",
    fontSize: 14,
    fontWeight: "600",
  },
  changeEmailText: {
    textAlign: "center",
    color: "#666",
    fontSize: 13,
    fontWeight: "500",
  },
});
