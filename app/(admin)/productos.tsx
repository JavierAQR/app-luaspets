// app/(admin)/productos.tsx
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

type ProductCategory = "ACCESSORY" | "FOOD" | "TOY";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  category: ProductCategory;
  price: number;
  stock: number;
  imageUrl?: string | null;
};

export default function ProductosAdminScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategory>("ACCESSORY");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setCategory("ACCESSORY");
    setPrice("");
    setStock("");
    setImageUri(null);
  };

  const loadProducts = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const res = await API.get<Product[]>("/products");
      setProducts(res.data);
    } catch (err: any) {
      console.log(err);
      Alert.alert("Error", "No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || "");
    setCategory(product.category);
    setPrice(String(product.price));
    setStock(String(product.stock));
    setImageUri(null); // Si cambia la imagen, se asignará aquí
    setModalVisible(true);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Necesitas dar acceso a la galería.");
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
    if (!name.trim())
      return Alert.alert("Validación", "El nombre es obligatorio.");
    if (!price.trim())
      return Alert.alert("Validación", "El precio es obligatorio.");

    try {
      setSaving(true);
      const token = await useAuth.getToken();

      const formData = new FormData();
      formData.append("name", name);
      if (description.trim()) formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("stock", stock || "0");

      if (imageUri) {
        formData.append("image", {
          uri: imageUri,
          type: "image/jpeg",
          name: "product.jpg",
        } as any);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (editingProduct) {
        await API.put(`/products/${editingProduct.id}`, formData, config);
      } else {
        await API.post("/products", formData, config);
      }

      await loadProducts();
      setModalVisible(false);
      resetForm();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      "Eliminar producto",
      `¿Seguro que deseas eliminar "${product.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await useAuth.getToken();
              await API.delete(`/products/${product.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              setProducts((prev) => prev.filter((p) => p.id !== product.id));
            } catch (err) {
              console.log(err);
              Alert.alert("Error", "No se pudo eliminar el producto.");
            }
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/80" }}
        style={styles.cardImage}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardCategory}>
          {item.category === "ACCESSORY"
            ? "Accesorio"
            : item.category === "FOOD"
            ? "Alimento"
            : "Juguete"}
        </Text>
        <Text style={styles.cardPrice}>S/ {Number(item.price).toFixed(2)}</Text>
        <Text style={styles.cardStock}>{item.stock} unidades</Text>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEditModal(item)}
          >
            <MaterialIcons name="edit" color="#fff" size={18} />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete" color="#fff" size={18} />
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#c568f2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No hay productos registrados.
          </Text>
        }
      />

      {/* Botón flotante */}
      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingProduct ? "Editar producto" : "Nuevo producto"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Descripción"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* Categorías */}
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.chipRow}>
            {(["ACCESSORY", "FOOD", "TOY"] as ProductCategory[]).map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, category === c && styles.chipSelected]}
                onPress={() => setCategory(c)}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === c && styles.chipTextSelected,
                  ]}
                >
                  {c === "ACCESSORY"
                    ? "Accesorio"
                    : c === "FOOD"
                    ? "Alimento"
                    : "Juguete"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Precio S/</Text>
            <TextInput
              style={styles.fieldInput}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="Ej: 50.00"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Stock</Text>
            <TextInput
              style={styles.fieldInput}
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
              placeholder="Ej: 30"
              placeholderTextColor="#aaa"
            />
          </View>

          <Text style={styles.label}>Imagen</Text>
          <View style={styles.imageRow}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : editingProduct?.imageUrl ? (
              <Image
                source={{ uri: editingProduct.imageUrl }}
                style={styles.previewImage}
              />
            ) : (
              <View style={[styles.previewImage, styles.previewPlaceholder]}>
                <MaterialIcons name="image" size={28} color="#aaa" />
              </View>
            )}

            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <MaterialIcons name="photo-library" color="#fff" size={18} />
              <Text style={styles.imageButtonText}>Elegir imagen</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
              disabled={saving}
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
                <Text style={styles.modalButtonText}>Guardar</Text>
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
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
  cardCategory: { fontSize: 12, color: "#777", marginTop: 2 },
  cardPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#c568f2",
    marginTop: 4,
  },
  cardStock: { fontSize: 12, color: "#666", marginTop: 2 },

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
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#c568f2",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  modalContent: { padding: 20, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20 },

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

  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  chipRow: { flexDirection: "row", gap: 8, marginBottom: 12 },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  chipSelected: { backgroundColor: "#c568f2", borderColor: "#c568f2" },
  chipText: { fontSize: 12, color: "#555" },
  chipTextSelected: { color: "#fff" },

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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#4a90e2",
    gap: 8,
  },
  imageButtonText: { color: "#fff", fontWeight: "600" },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },
  modalButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  cancelButton: { backgroundColor: "#eee" },
  saveButton: { backgroundColor: "#c568f2" },
  modalButtonText: { fontWeight: "600", color: "#333" },
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
