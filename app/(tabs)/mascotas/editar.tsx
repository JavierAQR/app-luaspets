// app/(tabs)/mascotas/editar.tsx
import { API } from "@/constants/api";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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

export default function EditarMascotaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState<SexType>(null);
  const [birthDate, setBirthDate] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null); // nueva imagen
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null); // imagen actual

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

        const pet = res.data;
        setName(pet.name);
        setSpecies(pet.species || "");
        setBreed(pet.breed || "");
        setSex(pet.sex ?? null);
        setBirthDate(pet.birthDate ? pet.birthDate.slice(0, 10) : "");
        setWeightKg(pet.weightKg ? String(pet.weightKg) : "");
        setNotes(pet.notes || "");
        setCurrentImageUrl(pet.imageUrl || null);
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a tu galería para cambiar la foto de tu mascota."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    if (!name.trim()) {
      Alert.alert("Validación", "El nombre de la mascota es obligatorio.");
      return;
    }

    if (!species.trim()) {
      Alert.alert("Validación", "La especie es obligatoria.");
      return;
    }

    try {
      setSaving(true);
      const token = await useAuth.getToken();
      if (!token) {
        await useAuth.clearSession();
        router.replace("/(auth)" as never);
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("species", species);

      formData.append("breed", breed || "");
      if (sex) formData.append("sex", sex);
      formData.append("birthDate", birthDate || "");
      formData.append("weightKg", weightKg || "");
      formData.append("notes", notes || "");

      if (imageUri) {
        formData.append("image", {
          uri: imageUri,
          type: "image/jpeg",
          name: "pet.jpg",
        } as any);
      }

      await API.put(`/pets/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Éxito", "Mascota actualizada correctamente.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      console.log("updatePet error:", err?.response?.data || err.message);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "No se pudo actualizar la mascota."
      );
    } finally {
      setSaving(false);
    }
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Mascota</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Imagen */}
        <View style={styles.imageSection}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.petImage} />
          ) : currentImageUrl ? (
            <Image source={{ uri: currentImageUrl }} style={styles.petImage} />
          ) : (
            <View style={[styles.petImage, styles.petImagePlaceholder]}>
              <MaterialIcons name="pets" size={40} color="#ccc" />
              <Text style={styles.placeholderText}>Sin foto</Text>
            </View>
          )}

          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <MaterialIcons name="photo-camera" size={20} color="#fff" />
            <Text style={styles.imageButtonText}>Cambiar foto</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Información básica</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre *"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Especie (Perro, Gato, etc.) *"
            placeholderTextColor="#aaa"
            value={species}
            onChangeText={setSpecies}
          />

          <TextInput
            style={styles.input}
            placeholder="Raza (opcional)"
            placeholderTextColor="#aaa"
            value={breed}
            onChangeText={setBreed}
          />

          <Text style={styles.label}>Sexo</Text>
          <View style={styles.chipRow}>
            {[
              { key: "MALE" as SexType, label: "Macho" },
              { key: "FEMALE" as SexType, label: "Hembra" },
              { key: "OTHER" as SexType, label: "Otro" },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.chip,
                  sex === option.key && styles.chipSelected,
                ]}
                onPress={() => setSex(option.key)}
              >
                <Text
                  style={[
                    styles.chipText,
                    sex === option.key && styles.chipTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Fecha de nacimiento</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD (opcional)"
            placeholderTextColor="#aaa"
            value={birthDate}
            onChangeText={setBirthDate}
          />

          <Text style={styles.label}>Peso aproximado</Text>
          <TextInput
            style={styles.input}
            placeholder="Peso en kg (opcional)"
            placeholderTextColor="#aaa"
            value={weightKg}
            onChangeText={setWeightKg}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Notas</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Notas adicionales (carácter, alergias, etc.)"
            placeholderTextColor="#aaa"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>
      </ScrollView>

      {/* Botón guardar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.9}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
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
    paddingBottom: 100,
  },

  imageSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  petImage: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  petImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 8,
    color: "#999",
    fontSize: 13,
    fontWeight: "500",
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#4a90e2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  imageButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fafafa",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 14,
    color: "#333",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
    marginTop: 6,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  chipSelected: {
    backgroundColor: "#c568f2",
    borderColor: "#c568f2",
  },
  chipText: {
    fontSize: 12,
    color: "#555",
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#fff",
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },
  saveButton: {
    backgroundColor: "#c568f2",
    borderRadius: 30,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#c568f2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
