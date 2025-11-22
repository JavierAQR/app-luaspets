import { API } from "@/constants/api";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "../styles/styles";

type CategoryType = "alimentos" | "juguetes" | "accesorios";
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

const categories = [
  { key: "alimentos" as CategoryType, label: "Alimentos" },
  { key: "juguetes" as CategoryType, label: "Juguetes" },
  { key: "accesorios" as CategoryType, label: "Accesorios" },
];

const CATEGORY_MAP: Record<ProductCategory, CategoryType> = {
  FOOD: "alimentos",
  TOY: "juguetes",
  ACCESSORY: "accesorios",
};

export default function ProductosScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<CategoryType>("alimentos");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get<Product[]>("/products");
      setProducts(res.data);
    } catch (err: any) {
      console.log("fetchProducts error:", err?.response?.data || err.message);
      Alert.alert(
        "Error",
        "No se pudieron cargar los productos. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleProductSelection = (productId: string) => {
    const product = products.find((p) => p.id === productId);

    // No permitir seleccionar si no hay stock
    if (product && product.stock === 0) return;

    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Productos filtrados por categoría
  const productsByCategory = useMemo(
    () =>
      products.filter(
        (product) => CATEGORY_MAP[product.category] === activeCategory
      ),
    [products, activeCategory]
  );

  // Luego filtro de búsqueda
  const filteredProducts = useMemo(
    () =>
      productsByCategory.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [productsByCategory, searchQuery]
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#c568f2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Título */}
      <Text style={styles.mainTitle}>¿Qué producto necesitas?</Text>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <MaterialIcons
          name="search"
          size={24}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Buscar..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Categorías */}
      <View style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryTab,
              activeCategory === category.key && styles.activeCategoryTab,
            ]}
            onPress={() => setActiveCategory(category.key)}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === category.key && styles.activeCategoryText,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de productos */}
      <ScrollView
        style={styles.servicesScroll}
        contentContainerStyle={styles.servicesContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
            No hay productos en esta categoría.
          </Text>
        ) : (
          filteredProducts.map((product) => {
            const isSelected = selectedProducts.includes(product.id);
            const isOutOfStock = product.stock === 0;

            return (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.serviceCard,
                  isSelected && styles.serviceCardSelected,
                  isOutOfStock && styles.serviceCardDisabled,
                ]}
                onPress={() => toggleProductSelection(product.id)}
                activeOpacity={isOutOfStock ? 1 : 0.8}
                disabled={isOutOfStock}
              >
                <View style={styles.imageContainer}>
                  <Image
                    source={{
                      uri:
                        product.imageUrl ||
                        "https://via.placeholder.com/200x200?text=Producto",
                    }}
                    style={[
                      styles.serviceImage,
                      isOutOfStock && styles.imageDisabled,
                    ]}
                  />

                  {isSelected && !isOutOfStock && (
                    <View style={styles.checkBadge}>
                      <MaterialIcons name="check" size={20} color="#fff" />
                    </View>
                  )}

                  {isOutOfStock && (
                    <View style={styles.outOfStockBadge}>
                      <Text style={styles.outOfStockText}>Agotado</Text>
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    styles.serviceName,
                    isOutOfStock && styles.textDisabled,
                  ]}
                >
                  {product.name}
                </Text>

                <Text
                  style={[
                    styles.servicePrice,
                    isOutOfStock && styles.textDisabled,
                  ]}
                >
                  s/{Number(product.price).toFixed(2)}
                </Text>

                <View style={styles.stockContainer}>
                  <MaterialIcons
                    name="inventory-2"
                    size={14}
                    color={
                      isOutOfStock
                        ? "#999"
                        : product.stock < 10
                        ? "#e74c3c"
                        : "#666"
                    }
                  />
                  <Text
                    style={[
                      styles.stockText,
                      isOutOfStock && styles.textDisabled,
                      !isOutOfStock &&
                        product.stock < 10 &&
                        styles.stockLow,
                    ]}
                  >
                    {isOutOfStock ? "Sin stock" : `Stock: ${product.stock}`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Botón flotante de agregar al carrito */}
      {selectedProducts.length > 0 && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity style={styles.floatingButton} activeOpacity={0.9}>
            <Text style={styles.floatingButtonText}>
              Agregar al carrito ({selectedProducts.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
