import { API } from "@/constants/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
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

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<"register" | "login">("login");

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
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
  
      const { token, user } = res.data; // viene tal como mostraste
  
      // Guardamos token + user
      await useAuth.saveSession(token, user);
  
      // Redirección según el rol
      if (user.role === "ADMIN") {
        router.replace("/(admin)" as never);
      } else {
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/register", {
        name,
        lastname,
        phoneNumber,
        email,
        password,
      });

      Alert.alert("Éxito", "Registro exitoso. Ahora puedes iniciar sesión.");

      setActiveTab("login");
      setName("");
      setLastname("");
      setPhoneNumber("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError("");
  }, [activeTab]);

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
          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "login" && styles.activeTab]}
              onPress={() => setActiveTab("login")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "login" && styles.activeTabText,
                ]}
              >
                Iniciar sesión
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "register" && styles.activeTab]}
              onPress={() => setActiveTab("register")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "register" && styles.activeTabText,
                ]}
              >
                Registrarse
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contenido dinámico */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 30 }}>
            <Text style={styles.welcomeText}>
              {activeTab === "login"
                ? "Bienvenido a Veterinaria Lua´s Pets"
                : "Crea tu cuenta para agendar tus citas"}
            </Text>

            {activeTab === "register" && (
              <>
                <TextInput
                  placeholder="Nombre"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Apellido"
                  placeholderTextColor="#999"
                  value={lastname}
                  onChangeText={setLastname}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Teléfono"
                  placeholderTextColor="#999"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  style={styles.input}
                  keyboardType="phone-pad"
                />
              </>
            )}

            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              autoCapitalize="none"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={activeTab === "login" ? handleLogin : handleRegister}
              loading={loading}
              style={styles.mainButton}
              labelStyle={{ fontSize: 16, fontWeight: "700" }}
            >
              {activeTab === "login" ? "Iniciar sesión" : "Registrarse"}
            </Button>

            {activeTab === "login" && (
              <TouchableOpacity
                onPress={() => router.push("/recover-password" as any)}
              >
                <Text style={styles.forgotPassword}>
                  ¿Olvidó su contraseña?
                </Text>
              </TouchableOpacity>
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 8,
    margin: 16,
    borderRadius: 50,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 50,
  },
  activeTab: {
    backgroundColor: "#c568f2",
    shadowColor: "#c568f2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    color: "#999",
    fontWeight: "600",
    fontSize: 15,
  },
  activeTabText: {
    color: "white",
    fontWeight: "700",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
    lineHeight: 28,
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
  forgotPassword: {
    textAlign: "center",
    color: "#333",
    marginTop: 15,
    fontSize: 14,
    fontWeight: "500",
  },
  error: {
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "500",
  },
});
