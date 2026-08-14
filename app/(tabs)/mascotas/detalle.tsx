// app/(tabs)/mascotas/detalle.tsx
import { API } from "@/constants/api";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type SexType = "MALE" | "FEMALE" | "OTHER" | null;

type Pet = {
  id: string;
  name: string;
  species: string;
  breed?: string | null;
  sex?: SexType;
  birthDate?: string | null;
  weightKg?: number | null;
  notes?: string | null;
  imageUrl?: string | null;
};

export default function DetalleMascotaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      Alert.alert("Error", "No se encontró la mascota.");
      router.back();
      return;
    }

    const fetchPet = async () => {
      try {
        const token = await useAuth.getToken();
        if (!token) {
          await useAuth.clearSession();
          router.replace("/(auth)" as never);
          return;
        }

        const res = await API.get<Pet>(`/pets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPet(res.data);
      } catch (err: any) {
        console.log("fetchPet error:", err?.response?.data || err.message);
        Alert.alert("Error", "No se pudo cargar la mascota.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const calcularEdad = (birthDate: string | null | undefined) => {
    if (!birthDate) return null;
    const n = new Date(birthDate);
    const diff = new Date().getFullYear() - n.getFullYear();
    return diff;
  };

  const handleDelete = () => {
    if (!pet) return;

    Alert.alert(
      "Eliminar mascota",
      `¿Seguro que deseas eliminar a ${pet.name}? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              const token = await useAuth.getToken();
              if (!token) {
                await useAuth.clearSession();
                router.replace("/(auth)" as never);
                return;
              }

              await API.delete(`/pets/${pet.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              Alert.alert("Éxito", "Mascota eliminada correctamente.", [
                {
                  text: "OK",
                  onPress: () => router.back(), // vuelve a la lista
                },
              ]);
            } catch (err: any) {
              console.log("deletePet error:", err?.response?.data || err.message);
              Alert.alert(
                "Error",
                err?.response?.data?.message ||
                  "No se pudo eliminar la mascota."
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !pet) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#c568f2" />
      </View>
    );
  }

  const edad = calcularEdad(pet.birthDate);
  const isDog =
    pet.species.toLowerCase().includes("perro") ||
    pet.species.toLowerCase() === "dog";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{pet.name}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Imagen */}
        <Image
          source={{
            uri:
              pet.imageUrl ||
              "https://via.placeholder.com/400x300?text=Mascota",
          }}
          style={styles.petImage}
        />

        {/* Card detalle */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.nameContainer}>
              <Text style={styles.petName}>{pet.name}</Text>
              <View
                style={[
                  styles.speciesBadge,
                  isDog ? styles.dogBadge : styles.catBadge,
                ]}
              >
                <MaterialIcons name="pets" size={14} color="#fff" />
                <Text style={styles.speciesText}>{pet.species}</Text>
              </View>
            </View>
          </View>

          {pet.breed && (
            <View style={styles.infoRow}>
              <MaterialIcons name="category" size={18} color="#999" />
              <Text style={styles.infoText}>{pet.breed}</Text>
            </View>
          )}

          <View style={styles.statsContainer}>
            {/* Edad */}
            <View style={styles.statItem}>
              <MaterialIcons name="cake" size={20} color="#c568f2" />
              <Text style={styles.statValue}>
                {edad !== null ? `${edad} ${edad === 1 ? "año" : "años"}` : "—"}
              </Text>
            </View>

            <View style={styles.statDivider} />

            {/* Peso */}
            <View style={styles.statItem}>
              <MaterialIcons name="monitor-weight" size={20} color="#c568f2" />
              <Text style={styles.statValue}>
                {pet.weightKg ? `${pet.weightKg} kg` : "—"}
              </Text>
            </View>

            <View style={styles.statDivider} />

            {/* Sexo */}
            <View style={styles.statItem}>
              <MaterialIcons
                name={
                  pet.sex === "MALE"
                    ? "male"
                    : pet.sex === "FEMALE"
                    ? "female"
                    : "pets"
                }
                size={20}
                color="#c568f2"
              />
              <Text style={styles.statValue}>
                {pet.sex === "MALE"
                  ? "Macho"
                  : pet.sex === "FEMALE"
                  ? "Hembra"
                  : "—"}
              </Text>
            </View>
          </View>

          {pet.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesTitle}>Notas</Text>
              <Text style={styles.notesText}>{pet.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Acciones */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.editButtonFooter]}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/mascotas/editar",
              params: { id: pet.id },
            } as any)
          }
        >
          <MaterialIcons name="edit" size={20} color="#fff" />
          <Text style={styles.footerButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, styles.deleteButtonFooter]}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="delete" size={20} color="#fff" />
              <Text style={styles.footerButtonText}>Eliminar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },

  petImage: {
    width: "100%",
    height: 230,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  nameContainer: { flex: 1 },
  petName: {
    fontSize: 24,
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
  dogBadge: { backgroundColor: "#3498db" },
  catBadge: { backgroundColor: "#e67e22" },
  speciesText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  infoText: { fontSize: 15, color: "#666", fontWeight: "600" },

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

  notesBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f9f1ff",
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7e3bb5",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: "#555",
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    flexDirection: "row",
    gap: 10,
  },
  footerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  editButtonFooter: {
    backgroundColor: "#c568f2",
  },
  deleteButtonFooter: {
    backgroundColor: "#e74c3c",
  },
  footerButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
