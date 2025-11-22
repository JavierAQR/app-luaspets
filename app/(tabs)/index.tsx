import { API } from '@/constants/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from '../styles/styles';

// Datos temporales de servicios
type CategoryType = "grooming" | "consultas" | "vacunas";
type ServiceType = "GROOMING" | "CONSULTATION" | "VACCINE";

type Service = {
  id: string;
  name: string;
  description?: string | null;
  type: ServiceType;
  durationMin?: number | null;
  price: number;
  imageUrl: string;
};

const CATEGORY_LABELS: { key: CategoryType; label: string }[] = [
  { key: "grooming", label: "Grooming" },
  { key: "consultas", label: "Consultas" },
  { key: "vacunas", label: "Vacunas" },
];

const SERVICE_TYPE_TO_CATEGORY: Record<ServiceType, CategoryType> = {
  GROOMING: "grooming",
  CONSULTATION: "consultas",
  VACCINE: "vacunas",
};

export default function ServiciosScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<CategoryType>("grooming");

  // 👇 ahora solo 1 servicio seleccionado
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await API.get<Service[]>("/services");
      setServices(res.data);
    } catch (err: any) {
      console.log("fetchServices error:", err?.response?.data || err.message);
      Alert.alert(
        "Error",
        "No se pudieron cargar los servicios. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServiceId((prev) => (prev === serviceId ? null : serviceId));
  };

  // Filtrar primero por categoría, luego por búsqueda
  const filteredServicesByCategory = useMemo(
    () =>
      services.filter(
        (svc) => SERVICE_TYPE_TO_CATEGORY[svc.type] === activeCategory
      ),
    [services, activeCategory]
  );

  const filteredServices = useMemo(
    () =>
      filteredServicesByCategory.filter((service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [filteredServicesByCategory, searchQuery]
  );

  const handleReserve = () => {
    if (!selectedServiceId) return;

    router.push({
      pathname: "/(tabs)/citas/nueva",
      params: { serviceId: selectedServiceId },
    } as any);
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
      {/* Título */}
      <Text style={styles.mainTitle}>¿Qué servicio necesitas?</Text>

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
        {CATEGORY_LABELS.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryTab,
              activeCategory === category.key && styles.activeCategoryTab,
            ]}
            onPress={() => {
              setActiveCategory(category.key);
              setSelectedServiceId(null); // limpia selección al cambiar categoría
            }}
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

      {/* Lista de servicios */}
      <ScrollView
        style={styles.servicesScroll}
        contentContainerStyle={styles.servicesContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredServices.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
            No hay servicios disponibles en esta categoría.
          </Text>
        ) : (
          filteredServices.map((service) => {
            const isSelected = selectedServiceId === service.id;

            return (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  isSelected && styles.serviceCardSelected,
                ]}
                onPress={() => toggleServiceSelection(service.id)}
                activeOpacity={0.8}
              >
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: service.imageUrl }}
                    style={styles.serviceImage}
                  />
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <MaterialIcons name="check" size={20} color="#fff" />
                    </View>
                  )}
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>
                  s/{Number(service.price).toFixed(2)}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Botón flotante de reservar */}
      {selectedServiceId && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={styles.floatingButton}
            activeOpacity={0.9}
            onPress={handleReserve}
          >
            <Text style={styles.floatingButtonText}>Reservar cita</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}