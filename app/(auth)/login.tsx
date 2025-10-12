import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { API } from "../../constants/api";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", { email, password });
      const { token } = res.data;
      await useAuth.saveToken(token);
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text variant="headlineMedium" style={{ textAlign: "center", marginBottom: 20 }}>
        Iniciar sesión
      </Text>
      <TextInput
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 20 }}
      />
      {error ? <Text style={{ color: "red", textAlign: "center" }}>{error}</Text> : null}
      <Button mode="contained" onPress={handleLogin} loading={loading}>
        Entrar
      </Button>

      <Button onPress={() => router.push("/(auth)/register")} style={{ marginTop: 10 }}>
        ¿No tienes cuenta? Regístrate
      </Button>
    </View>
  );
}
