import { API } from "@/constants/api";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Pet = {
  id: string;
  name: string;
  species: string;
  breed?: string | null;
  sex?: "MALE" | "FEMALE" | "OTHER" | null;
  birthDate?: string | null;
  weightKg?: number | null;
  notes?: string | null;
  imageUrl?: string | null;
};

export default function MascotasScreen() {
  const [mascotas, setMascotas] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      const token = await useAuth.getToken();

      const res = await API.get("/pets", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMascotas(res.data);
    } catch (err: any) {
      console.log("fetchPets error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [fetchPets])
  );

  const calcularEdad = (birthDate: string | null | undefined) => {
    if (!birthDate) return null;
    const nacimiento = new Date(birthDate);
    const diff = new Date().getFullYear() - nacimiento.getFullYear();
    return diff;
  };

  const renderMascotaCard = ({ item }: { item: Pet }) => {
    const edad = calcularEdad(item.birthDate);
    const isDog =
      item.species.toLowerCase().includes("perro") ||
      item.species.toLowerCase() === "dog";

    return (
      <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/mascotas/detalle",
          params: { id: item.id },
        } as any)
      }
    >
        <Image
          source={{
            uri:
              item.imageUrl ||
              "https://via.placeholder.com/400x300?text=Mascota",
          }}
          style={styles.petImage}
        />

        <View style={styles.cardContent}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.nameContainer}>
              <Text style={styles.petName}>{item.name}</Text>

              <View
                style={[
                  styles.speciesBadge,
                  isDog ? styles.dogBadge : styles.catBadge,
                ]}
              >
                <MaterialIcons name="pets" size={14} color="#fff" />
                <Text style={styles.speciesText}>{item.species}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/mascotas/editar",
                  params: { id: item.id },
                } as any)
              }
            >
              <MaterialIcons name="edit" size={20} color="#c568f2" />
            </TouchableOpacity>
          </View>

          {/* Raza */}
          {item.breed && (
            <View style={styles.infoRow}>
              <MaterialIcons name="category" size={16} color="#999" />
              <Text style={styles.infoText}>{item.breed}</Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            {/* Edad */}
            <View style={styles.statItem}>
              <MaterialIcons name="cake" size={18} color="#c568f2" />
              <Text style={styles.statValue}>
                {edad !== null ? `${edad} ${edad === 1 ? "año" : "años"}` : "—"}
              </Text>
            </View>

            <View style={styles.statDivider} />

            {/* Peso */}
            <View style={styles.statItem}>
              <MaterialIcons name="monitor-weight" size={18} color="#c568f2" />
              <Text style={styles.statValue}>
                {item.weightKg ? `${item.weightKg} kg` : "—"}
              </Text>
            </View>

            <View style={styles.statDivider} />

            {/* Sexo */}
            <View style={styles.statItem}>
              <MaterialIcons
                name={
                  item.sex === "MALE"
                    ? "male"
                    : item.sex === "FEMALE"
                    ? "female"
                    : "pets"
                }
                size={18}
                color="#c568f2"
              />
              <Text style={styles.statValue}>
                {item.sex === "MALE"
                  ? "Macho"
                  : item.sex === "FEMALE"
                  ? "Hembra"
                  : "—"}
              </Text>
            </View>
          </View>

          {/* Notas */}
          {item.notes && (
            <View style={styles.colorContainer}>
              <View style={styles.colorDot} />
              <Text style={styles.colorText}>{item.notes}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#c568f2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mis Mascotas</Text>
          <Text style={styles.subtitle}>
            {mascotas.length}{" "}
            {mascotas.length === 1
              ? "mascota registrada"
              : "mascotas registradas"}
          </Text>
        </View>
      </View>

      {/* Lista */}
      {mascotas.length > 0 ? (
        <FlatList
          data={mascotas}
          renderItem={renderMascotaCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="pets" size={80} color="#ddd" />
          <Text style={styles.emptyTitle}>No tienes mascotas registradas</Text>
          <Text style={styles.emptySubtitle}>
            Agrega tu primera mascota para comenzar.
          </Text>
        </View>
      )}

      {/* Botón flotante */}
      <TouchableOpacity
        style={styles.fabButton}
        activeOpacity={0.8}
        onPress={() => router.push("/(tabs)/mascotas/nueva" as never)}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: "#999",
    fontWeight: "600",
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  petName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  speciesBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  dogBadge: {
    backgroundColor: "#3498db",
  },
  catBadge: {
    backgroundColor: "#e67e22",
  },
  speciesText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
    justifyContent: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
  },
  colorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#c568f2",
  },
  colorText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
  },
  fabButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#c568f2",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#c568f2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
