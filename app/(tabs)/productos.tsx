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

// Datos temporales de productos
const PRODUCTOS_DATA = {
    alimentos: [
      {
        id: 1,
        nombre: 'Dog Chow Adulto',
        precio: 45,
        stock: 25,
        imagen: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
      },
      {
        id: 2,
        nombre: 'Cat Chow Gatitos',
        precio: 38,
        stock: 18,
        imagen: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=400',
      },
      {
        id: 3,
        nombre: 'Ricocan Premium',
        precio: 52,
        stock: 12,
        imagen: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400',
      },
      {
        id: 4,
        nombre: 'Whiskas Adulto',
        precio: 35,
        stock: 0,
        imagen: 'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=400',
      },
    ],
    juguetes: [
      {
        id: 5,
        nombre: 'Pelota de goma',
        precio: 15,
        stock: 45,
        imagen: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400',
      },
      {
        id: 6,
        nombre: 'Ratón de peluche',
        precio: 12,
        stock: 32,
        imagen: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400',
      },
      {
        id: 7,
        nombre: 'Cuerda para jalar',
        precio: 18,
        stock: 28,
        imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
      },
      {
        id: 8,
        nombre: 'Láser para gatos',
        precio: 25,
        stock: 15,
        imagen: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400',
      },
    ],
    accesorios: [
      {
        id: 9,
        nombre: 'Collar antipulgas',
        precio: 30,
        stock: 20,
        imagen: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
      },
      {
        id: 10,
        nombre: 'Plato de cerámica',
        precio: 22,
        stock: 35,
        imagen: 'https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=400',
      },
      {
        id: 11,
        nombre: 'Cama acolchada',
        precio: 65,
        stock: 8,
        imagen: 'https://images.unsplash.com/photo-1544568104-5b7eb8189935?w=400',
      },
      {
        id: 12,
        nombre: 'Transportadora',
        precio: 85,
        stock: 10,
        imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
      },
    ],
  };

type CategoryType = 'alimentos' | 'juguetes' | 'accesorios';

export default function ProductosScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<CategoryType>('alimentos');
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  
    const categories = [
      { key: 'alimentos' as CategoryType, label: 'Alimentos' },
      { key: 'juguetes' as CategoryType, label: 'Juguetes' },
      { key: 'accesorios' as CategoryType, label: 'Accesorios' },
    ];
  
    const currentProducts = PRODUCTOS_DATA[activeCategory];
  
    const toggleProductSelection = (productId: number) => {
      const product = currentProducts.find(p => p.id === productId);
      
      // No permitir seleccionar si no hay stock
      if (product && product.stock === 0) return;
      
      if (selectedProducts.includes(productId)) {
        setSelectedProducts(selectedProducts.filter((id) => id !== productId));
      } else {
        setSelectedProducts([...selectedProducts, productId]);
      }
    };
  
    const filteredProducts = currentProducts.filter((product) =>
      product.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    return (
      <View style={styles.container}>
        {/* Título */}
        <Text style={styles.mainTitle}>¿Qué producto necesitas?</Text>
  
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
  
        {/* Lista de productos */}
        <ScrollView
          style={styles.servicesScroll}
          contentContainerStyle={styles.servicesContainer}
          showsVerticalScrollIndicator={false}
        >
          {filteredProducts.map((product) => {
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
                    source={{ uri: product.imagen }} 
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
                
                <Text style={[
                  styles.serviceName,
                  isOutOfStock && styles.textDisabled,
                ]}>
                  {product.nombre}
                </Text>
                
                <Text style={[
                  styles.servicePrice,
                  isOutOfStock && styles.textDisabled,
                ]}>
                  s/{product.precio}
                </Text>
                
                <View style={styles.stockContainer}>
                  <MaterialIcons 
                    name="inventory-2" 
                    size={14} 
                    color={isOutOfStock ? '#999' : product.stock < 10 ? '#e74c3c' : '#666'} 
                  />
                  <Text style={[
                    styles.stockText,
                    isOutOfStock && styles.textDisabled,
                    !isOutOfStock && product.stock < 10 && styles.stockLow,
                  ]}>
                    {isOutOfStock ? 'Sin stock' : `Stock: ${product.stock}`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
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