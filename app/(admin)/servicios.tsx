// app/(admin)/servicios.tsx
import { API } from "@/constants/api";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type ServiceType = "GROOMING" | "CONSULTATION" | "VACCINE";

type Service = {
  id: string;
  name: string;
  description?: string | null;
  type: ServiceType;
  durationMin?: number | null;
  price: number;
  imageUrl: string;
  isActive: boolean;
};

export default function ServiciosAdminScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ServiceType>("GROOMING");
  const [durationMin, setDurationMin] = useState("");
  const [price, setPrice] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null); // nueva imagen
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingService(null);
    setName("");
    setDescription("");
    setType("GROOMING");
    setDurationMin("");
    setPrice("");
    setImageUri(null);
  };

  const loadServices = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const res = await API.get<Service[]>("/services");
      setServices(res.data);
    } catch (err: any) {
      console.log(err?.response?.data || err.message);
      Alert.alert("Error", "No se pudieron cargar los servicios");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const onRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description || "");
    setType(service.type);
    setDurationMin(service.durationMin ? String(service.durationMin) : "");
    setPrice(String(service.price));
    setImageUri(null);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a tu galería para subir imágenes."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validación", "El nombre es obligatorio.");
      return;
    }
    if (!price.trim()) {
      Alert.alert("Validación", "El precio es obligatorio.");
      return;
    }
    if (!editingService && !imageUri) {
      // para crear la imagen es obligatoria
      Alert.alert(
        "Validación",
        "Debes seleccionar una imagen para el servicio."
      );
      return;
    }

    try {
      setSaving(true);

      const token = await useAuth.getToken();
      if (!token) {
        Alert.alert("Sesión expirada", "Vuelve a iniciar sesión.");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      if (description.trim()) formData.append("description", description);
      formData.append("type", type);
      if (durationMin.trim()) formData.append("durationMin", durationMin);
      formData.append("price", price);

      // Si seleccionó nueva imagen, la adjuntamos
      if (imageUri) {
        const file: any = {
          uri: imageUri,
          name: "service.jpg",
          type: "image/jpeg",
        };
        formData.append("image", file);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (editingService) {
        // UPDATE
        await API.put(`/services/${editingService.id}`, formData, config);
      } else {
        // CREATE
        await API.post("/services", formData, config);
      }

      await loadServices();
      setModalVisible(false);
      resetForm();
    } catch (err: any) {
      console.log(err?.response?.data || err.message);
      Alert.alert(
        "Error",
        editingService
          ? "No se pudo actualizar el servicio."
          : "No se pudo crear el servicio."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (service: Service) => {
    Alert.alert(
      "Eliminar servicio",
      `¿Seguro que quieres eliminar "${service.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await useAuth.getToken();
              if (!token) {
                Alert.alert("Sesión expirada", "Vuelve a iniciar sesión.");
                return;
              }

              await API.delete(`/services/${service.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              setServices((prev) =>
                prev.filter((item) => item.id !== service.id)
              );
            } catch (err: any) {
              console.log(err?.response?.data || err.message);
              Alert.alert("Error", "No se pudo eliminar el servicio.");
            }
          },
        },
      ]
    );
  };

  const renderServiceItem = ({ item }: { item: Service }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardPrice}>
            S/ {Number(item.price).toFixed(2)}
          </Text>
        </View>

        <Text style={styles.cardType}>
          {item.type === "GROOMING"
            ? "Baño / Grooming"
            : item.type === "CONSULTATION"
            ? "Consulta"
            : "Vacuna"}
        </Text>

        {item.durationMin ? (
          <Text style={styles.cardSubtitle}>{item.durationMin} min.</Text>
        ) : null}

        {item.description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEditModal(item)}
          >
            <MaterialIcons name="edit" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderServiceItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No hay servicios registrados.</Text>
          </View>
        }
      />

      {/* Botón flotante para crear */}
      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal de creación / edición */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => {
          if (!saving) {
            setModalVisible(false);
            resetForm();
          }
        }}
      >
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingService ? "Editar servicio" : "Nuevo servicio"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Descripción (opcional)"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* Selector simple de tipo */}
          <Text style={styles.label}>Tipo de servicio</Text>
          <View style={styles.chipRow}>
            {(["GROOMING", "CONSULTATION", "VACCINE"] as ServiceType[]).map(
              (t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, type === t && styles.chipSelected]}
                  onPress={() => setType(t)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      type === t && styles.chipTextSelected,
                    ]}
                  >
                    {t === "GROOMING"
                      ? "Grooming"
                      : t === "CONSULTATION"
                      ? "Consulta"
                      : "Vacuna"}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Duración (minutos)</Text>
            <TextInput
              style={styles.fieldInput}
              value={durationMin}
              onChangeText={setDurationMin}
              keyboardType="numeric"
              placeholder="Ej: 45"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Precio (S/)</Text>
            <TextInput
              style={styles.fieldInput}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="Ej: 35.00"
              placeholderTextColor="#aaa"
            />
          </View>

          <Text style={styles.label}>Imagen</Text>
          <View style={styles.imageRow}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : editingService ? (
              <Image
                source={{ uri: editingService.imageUrl }}
                style={styles.previewImage}
              />
            ) : (
              <View style={[styles.previewImage, styles.previewPlaceholder]}>
                <MaterialIcons name="image" size={32} color="#ccc" />
              </View>
            )}

            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <MaterialIcons name="photo-library" size={20} color="#fff" />
              <Text style={styles.imageButtonText}>Seleccionar imagen</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              disabled={saving}
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>
                  {editingService ? "Guardar cambios" : "Crear"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
  cardPrice: { fontSize: 14, fontWeight: "700", color: "#c568f2" },
  cardType: { marginTop: 4, fontSize: 12, color: "#666" },
  cardSubtitle: { fontSize: 12, color: "#666" },
  cardDescription: { fontSize: 12, color: "#777", marginTop: 4 },
  cardActions: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  editButton: { backgroundColor: "#4a90e2" },
  deleteButton: { backgroundColor: "#e94e4e" },
  actionButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#c568f2",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    color: "#555",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
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
  },
  chipTextSelected: {
    color: "#fff",
  },

  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  previewPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4a90e2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  imageButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: "#eee",
  },
  saveButton: {
    backgroundColor: "#c568f2",
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  field: {
    marginBottom: 14,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
  },

  fieldInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 14,
  },
});
