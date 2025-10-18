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
import styles from '../styles/styles';

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
      imagen: 'https://cdn.shopify.com/s/files/1/0552/3750/9303/files/corte_de_pelo_perros_1024x1024.png?v=1736509890',
    },
    {
      id: 3,
      nombre: 'Baño completo',
      precio: 35,
      imagen: 'https://arqa.com/empresas/wp-content/uploads/sites/2/2023/11/har03083-1-860x573.jpg',
    },
    {
      id: 4,
      nombre: 'Corte de uñas',
      precio: 15,
      imagen: 'https://jelpin.cl/media/wysiwyg/Blog/corte_de_u_as_mascotas.jpg',
    },
  ],
  consultas: [
    {
      id: 5,
      nombre: 'Consulta general',
      precio: 40,
      imagen: 'https://selecciones.com.mx/wp-content/uploads/2019/08/consultas-en-el-veterinario.jpg',
    },
    {
      id: 6,
      nombre: 'Control veterinario',
      precio: 35,
      imagen: 'https://purina.co.cr/sites/default/files/2023-11/consulta-veterinaria-cachorro-cr.jpg',
    },
    {
      id: 7,
      nombre: 'Consulta especializada',
      precio: 60,
      imagen: 'https://www.veterinariadogtor.com/pictures/pages/13/Consulta-Especializada.jpg',
    },
  ],
  vacunas: [
    {
      id: 8,
      nombre: 'Vacuna antirrábica',
      precio: 30,
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnNWPENxRRO5WdundkPOo7sZXYFfm9whUrfA&s',
    },
    {
      id: 9,
      nombre: 'Vacuna séxtuple',
      precio: 45,
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhnkriKZLs5ln4OHeqDtJ_wK3USJqvBakAnQ&s',
    },
    {
      id: 10,
      nombre: 'Vacuna triple felina',
      precio: 40,
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkhG-CMwFOBRWKgUx2mpcd-XtnJE12Nho70Q&s',
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

