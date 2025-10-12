import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { API } from "../../constants/api";

export default function Register() {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    try {
      await API.post("/auth/register", { name, lastname, email, phoneNumber, password });
      router.replace("/(auth)/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text variant="headlineMedium" style={{ textAlign: "center", marginBottom: 20 }}>
        Crear cuenta
      </Text>
      <TextInput label="Nombre" value={name} onChangeText={setName} style={{ marginBottom: 10 }} />
      <TextInput
        label="Apellido"
        value={lastname}
        onChangeText={setLastname}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        label="Teléfono"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        style={{ marginBottom: 10 }}
      />
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
      <Button mode="contained" onPress={handleRegister} loading={loading}>
        Registrarse
      </Button>

      <Button onPress={() => router.replace("/(auth)/login")} style={{ marginTop: 10 }}>
        ¿Ya tienes cuenta? Inicia sesión
      </Button>
    </View>
  );
}
