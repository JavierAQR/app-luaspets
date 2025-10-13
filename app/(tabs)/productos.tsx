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
        imagen: 'https://www.superpet.pe/on/demandware.static/-/Sites-SuperPet-master-catalog/default/dw394e2959/images/AP000052.jpg',
      },
      {
        id: 2,
        nombre: 'Cat Chow Gatitos',
        precio: 38,
        stock: 18,
        imagen: 'https://www.superpet.pe/on/demandware.static/-/Sites-SuperPet-master-catalog/default/dwcc985b17/images/AG000039_m.jpg',
      },
      {
        id: 3,
        nombre: 'Ricocan Premium',
        precio: 52,
        stock: 12,
        imagen: 'https://www.superpet.pe/on/demandware.static/-/Sites-SuperPet-master-catalog/default/dw5ac98670/images/ricocan-edad-avanzada-adultos-7-todas-las-razas-x-01-kg.jpg',
      },
      {
        id: 4,
        nombre: 'Whiskas Adulto',
        precio: 35,
        stock: 0,
        imagen: 'https://www.superpet.pe/on/demandware.static/-/Sites-SuperPet-master-catalog/default/dwd02fca16/images/AG000784.jpg',
      },
    ],
    juguetes: [
      {
        id: 5,
        nombre: 'Pelota de goma',
        precio: 15,
        stock: 45,
        imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTEQd1RsaAvpSOXul8JK6_PdOcmT8p1YEj7w&s',
      },
      {
        id: 6,
        nombre: 'Ratón de peluche',
        precio: 12,
        stock: 32,
        imagen: 'https://www.superpet.pe/on/demandware.static/-/Sites-SuperPet-master-catalog/default/dwbf1908a6/images/The%20Cat%20Band%20Raton%20MD005238.jpg',
      },
      {
        id: 7,
        nombre: 'Cuerda para jalar',
        precio: 18,
        stock: 28,
        imagen: 'https://rimage.ripley.com.pe/home.ripley/Attachment/MKP/3704/PMP20000562563/imagen5-1.jpeg',
      },
      {
        id: 8,
        nombre: 'Láser para gatos',
        precio: 25,
        stock: 15,
        imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUBkVqencvb302dVsQgFj_XP6yzHaDtYjoFQ&s',
      },
    ],
    accesorios: [
      {
        id: 9,
        nombre: 'Collar antipulgas',
        precio: 30,
        stock: 20,
        imagen: 'https://rimage.ripley.com.pe/home.ripley/Attachment/MKP/5500/PMP20000750300/full_image-1.jpeg',
      },
      {
        id: 10,
        nombre: 'Plato de cerámica',
        precio: 22,
        stock: 35,
        imagen: 'https://dojiw2m9tvv09.cloudfront.net/27184/product/plato-doble-loza8854.jpg',
      },
      {
        id: 11,
        nombre: 'Cama acolchada',
        precio: 65,
        stock: 8,
        imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg8sPq4DgZCyBOxC3za3mjnfmWoUwQSO3H1Q&s',
      },
      {
        id: 12,
        nombre: 'Transportadora',
        precio: 85,
        stock: 10,
        imagen: 'https://media.falabella.com/falabellaPE/144945747_01/w=1500,h=1500,fit=pad',
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