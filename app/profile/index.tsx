import CustomHeader from "@/components/CustomHeader";
import { API } from "@/constants/api";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const token = await useAuth.getToken();
      const response = await API.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (err: any) {
      console.log("fetchProfile error:", err);

      if (err.response?.status === 401) {
        console.log("Token inválido, borrando token...");
        await useAuth.clearSession()
        router.replace("/(auth)");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await useAuth.clearSession()
    router.replace("/(auth)");
  };

  if (loading || !user) {
    return (
      <View style={styles.container}>
        <CustomHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c568f2" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <CustomHeader />
      {/* Header con avatar */}
      <View style={styles.header}>
        {user?.profileImage ? (
          <Image source={{ uri: user.profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarLetter}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
        )}

        <Text style={styles.name}>
          {user.name} {user.lastname}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Tarjeta de información */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información personal</Text>

        <View style={styles.infoItem}>
          <View style={styles.infoIcon}>
            <MaterialIcons name="phone" size={22} color="#c568f2" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>
              {user.phoneNumber || "No registrado"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <View style={styles.infoIcon}>
            <MaterialIcons name="location-on" size={22} color="#c568f2" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Dirección</Text>
            <Text style={styles.infoValue}>
              {user.address || "No registrada"}
            </Text>
          </View>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/profile/edit")}
          activeOpacity={0.8}
        >
          <MaterialIcons name="edit" size={20} color="#fff" />
          <Text style={styles.editButtonText}>Editar perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <MaterialIcons name="logout" size={20} color="#e74c3c" />
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: "#c568f2",
  },
  avatarPlaceholder: {
    backgroundColor: "#c568f2",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "700",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 5,
  },
  email: {
    fontSize: 15,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#999",
    marginBottom: 3,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 5,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: 25,
    gap: 15,
  },
  editButton: {
    backgroundColor: "#c568f2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 50,
    gap: 10,
    shadowColor: "#c568f2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  logoutButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 50,
    gap: 10,
    borderWidth: 2,
    borderColor: "#e74c3c",
  },
  logoutButtonText: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "700",
  },
});
