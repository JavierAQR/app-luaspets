import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './styles';

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

