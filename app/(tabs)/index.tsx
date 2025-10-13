import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

// Datos temporales de servicios
const SERVICIOS_DATA = {
  grooming: [
    {
      id: 1,
      nombre: 'Baño básico',
      precio: 25,
      imagen: 'https://img.freepik.com/foto-gratis/lavar-perro-mascota-casa_23-2149627259.jpg?semt=ais_hybrid&w=740&q=80',
    },
    {
      id: 2,
      nombre: 'Corte de pelo',
      precio: 20,
      imagen: 'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=400',
    },
    {
      id: 3,
      nombre: 'Baño completo',
      precio: 35,
      imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
    },
    {
      id: 4,
      nombre: 'Corte de uñas',
      precio: 15,
      imagen: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400',
    },
  ],
  consultas: [
    {
      id: 5,
      nombre: 'Consulta general',
      precio: 40,
      imagen: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400',
    },
    {
      id: 6,
      nombre: 'Control veterinario',
      precio: 35,
      imagen: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400',
    },
    {
      id: 7,
      nombre: 'Consulta especializada',
      precio: 60,
      imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    },
  ],
  vacunas: [
    {
      id: 8,
      nombre: 'Vacuna antirrábica',
      precio: 30,
      imagen: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
    },
    {
      id: 9,
      nombre: 'Vacuna séxtuple',
      precio: 45,
      imagen: 'https://images.unsplash.com/photo-1530126483408-aa533e55bdb2?w=400',
    },
    {
      id: 10,
      nombre: 'Vacuna triple felina',
      precio: 40,
      imagen: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    },
  ],
};

type CategoryType = 'grooming' | 'consultas' | 'vacunas';

export default function ServiciosScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('grooming');
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

  const categories = [
    { key: 'grooming' as CategoryType, label: 'Grooming' },
    { key: 'consultas' as CategoryType, label: 'Consultas' },
    { key: 'vacunas' as CategoryType, label: 'Vacunas' },
  ];

  const currentServices = SERVICIOS_DATA[activeCategory];

  const toggleServiceSelection = (serviceId: number) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const filteredServices = currentServices.filter((service) =>
    service.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header con logo y botones */}
     {/*  <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialIcons name="person" size={28} color="#333" />
        </TouchableOpacity>

        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity style={styles.headerButton}>
          <MaterialIcons name="shopping-cart" size={28} color="#333" />
        </TouchableOpacity>
      </View> */}

      {/* Título */}
      <Text style={styles.mainTitle}>¿Qué servicio necesitas?</Text>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#999" style={styles.searchIcon} />
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

      {/* Lista de servicios */}
      <ScrollView
        style={styles.servicesScroll}
        contentContainerStyle={styles.servicesContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredServices.map((service) => {
          const isSelected = selectedServices.includes(service.id);
          return (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
              onPress={() => toggleServiceSelection(service.id)}
              activeOpacity={0.8}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: service.imagen }} style={styles.serviceImage} />
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <MaterialIcons name="check" size={20} color="#fff" />
                  </View>
                )}
              </View>
              <Text style={styles.serviceName}>{service.nombre}</Text>
              <Text style={styles.servicePrice}>s/{service.precio}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Botón flotante de reservar */}
      {selectedServices.length > 0 && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity style={styles.floatingButton} activeOpacity={0.9}>
            <Text style={styles.floatingButtonText}>
              Reservar cita ({selectedServices.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 60,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeCategoryTab: {
    borderBottomColor: '#c568f2',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeCategoryText: {
    color: '#c568f2',
  },
  servicesScroll: {
    flex: 1,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 20,
  },
  serviceCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceCardSelected: {
    borderWidth: 3,
    borderColor: '#c568f2',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  serviceImage: {
    width: CARD_WIDTH - 30,
    height: CARD_WIDTH - 30,
    borderRadius: 100,
  },
  checkBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#c568f2',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#c568f2',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  floatingButton: {
    backgroundColor: '#c568f2',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#c568f2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});