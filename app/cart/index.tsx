import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CARRITO_INICIAL = [
  {
    id: 1,
    nombre: 'Dog Chow Adulto 5kg',
    precio: 45,
    cantidad: 2,
    stock: 25,
    imagen: 'https://www.superpet.pe/on/demandware.static/-/Sites-SuperPet-master-catalog/default/dw394e2959/images/AP000052.jpg',
    categoria: 'Alimentos',
  },
  {
    id: 2,
    nombre: 'Pelota de goma',
    precio: 15,
    cantidad: 1,
    stock: 45,
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTEQd1RsaAvpSOXul8JK6_PdOcmT8p1YEj7w&s',
    categoria: 'Juguetes',
  },
  {
    id: 3,
    nombre: 'Collar antipulgas',
    precio: 30,
    cantidad: 1,
    stock: 20,
    imagen: 'https://rimage.ripley.com.pe/home.ripley/Attachment/MKP/5500/PMP20000750300/full_image-1.jpeg',
    categoria: 'Accesorios',
  },
  {
    id: 4,
    nombre: 'Cama acolchada',
    precio: 65,
    cantidad: 1,
    stock: 8,
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg8sPq4DgZCyBOxC3za3mjnfmWoUwQSO3H1Q&s',
    categoria: 'Accesorios',
  },
];

type CarritoItem = {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
  imagen: string;
  categoria: string;
};

export default function CarritoScreen() {
  const router = useRouter();
  const [carritoItems, setCarritoItems] = useState<CarritoItem[]>(CARRITO_INICIAL);

  const actualizarCantidad = (id: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    
    setCarritoItems(items =>
      items.map(item => {
        if (item.id === id) {
          if (nuevaCantidad > item.stock) {
            Alert.alert('Stock insuficiente', `Solo hay ${item.stock} unidades disponibles`);
            return item;
          }
          return { ...item, cantidad: nuevaCantidad };
        }
        return item;
      })
    );
  };

  const eliminarItem = (id: number) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de eliminar este producto del carrito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => setCarritoItems(items => items.filter(item => item.id !== id)),
        },
      ]
    );
  };

  const calcularSubtotal = () => {
    return carritoItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  };

  const calcularEnvio = () => {
    const subtotal = calcularSubtotal();
    return subtotal > 100 ? 0 : 10; // Envío gratis si es mayor a 100
  };

  const calcularTotal = () => {
    return calcularSubtotal() + calcularEnvio();
  };

  const handleCheckout = () => {
    if (carritoItems.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos al carrito para continuar');
      return;
    }
    Alert.alert('Procesando compra', 'Redirigiendo a checkout...');
    // Aquí iría la navegación al checkout
  };

  const vaciarCarrito = () => {
    Alert.alert(
      'Vaciar carrito',
      '¿Estás seguro de eliminar todos los productos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Vaciar',
          style: 'destructive',
          onPress: () => setCarritoItems([]),
        },
      ]
    );
  };

  const subtotal = calcularSubtotal();
  const envio = calcularEnvio();
  const total = calcularTotal();
  const envioGratis = envio === 0;

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        {carritoItems.length > 0 && (
          <TouchableOpacity onPress={vaciarCarrito} style={styles.clearButton}>
            <MaterialIcons name="delete-outline" size={24} color="#e74c3c" />
          </TouchableOpacity>
        )}
        {carritoItems.length === 0 && <View style={{ width: 24 }} />}
      </View>

      {carritoItems.length > 0 ? (
        <>
          {/* Lista de productos */}
          <ScrollView 
            style={styles.scrollContent}
            contentContainerStyle={styles.productsContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Banner de envío gratis */}
            {!envioGratis && (
              <View style={styles.shippingBanner}>
                <MaterialIcons name="local-shipping" size={20} color="#3498db" />
                <Text style={styles.shippingBannerText}>
                  ¡Agrega s/{(100 - subtotal).toFixed(2)} más para envío gratis!
                </Text>
              </View>
            )}

            {envioGratis && (
              <View style={[styles.shippingBanner, styles.shippingBannerSuccess]}>
                <MaterialIcons name="check-circle" size={20} color="#27ae60" />
                <Text style={[styles.shippingBannerText, { color: '#27ae60' }]}>
                  ¡Envío gratis en este pedido!
                </Text>
              </View>
            )}

            {/* Items del carrito */}
            {carritoItems.map((item) => (
              <View key={item.id} style={styles.productCard}>
                <Image source={{ uri: item.imagen }} style={styles.productImage} />
                
                <View style={styles.productInfo}>
                  <View style={styles.productHeader}>
                    <View style={styles.productNameContainer}>
                      <Text style={styles.productName}>{item.nombre}</Text>
                      <Text style={styles.productCategory}>{item.categoria}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => eliminarItem(item.id)}
                      style={styles.deleteButton}
                    >
                      <MaterialIcons name="close" size={20} color="#999" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>s/ {item.precio.toFixed(2)}</Text>
                    
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => actualizarCantidad(item.id, item.cantidad - 1)}
                      >
                        <MaterialIcons name="remove" size={18} color="#333" />
                      </TouchableOpacity>
                      
                      <Text style={styles.quantityText}>{item.cantidad}</Text>
                      
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => actualizarCantidad(item.id, item.cantidad + 1)}
                      >
                        <MaterialIcons name="add" size={18} color="#333" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.productTotal}>
                    Total: s/ {(item.precio * item.cantidad).toFixed(2)}
                  </Text>

                  {item.cantidad >= item.stock && (
                    <View style={styles.stockWarning}>
                      <MaterialIcons name="warning" size={14} color="#f39c12" />
                      <Text style={styles.stockWarningText}>
                        Cantidad máxima disponible
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Resumen y checkout */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>s/ {subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.shippingLabel}>
                <Text style={styles.summaryLabel}>Envío</Text>
                {envioGratis && (
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>GRATIS</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.summaryValue, envioGratis && styles.freeShipping]}>
                {envioGratis ? 's/ 0.00' : `s/ ${envio.toFixed(2)}`}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>s/ {total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handleCheckout}
              activeOpacity={0.8}
            >
              <MaterialIcons name="shopping-cart-checkout" size={22} color="#fff" />
              <Text style={styles.checkoutButtonText}>
                Proceder al pago
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="shopping-cart" size={100} color="#ddd" />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptySubtitle}>
            Agrega productos para comenzar tu compra
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/productos')}
          >
            <MaterialIcons name="storefront" size={20} color="#fff" />
            <Text style={styles.shopButtonText}>Ver productos</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  clearButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  productsContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  shippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 15,
    gap: 10,
  },
  shippingBannerSuccess: {
    backgroundColor: '#e8f8f0',
  },
  shippingBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productNameContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#c568f2',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 2,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  productTotal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  stockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  stockWarningText: {
    fontSize: 11,
    color: '#f39c12',
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '700',
  },
  shippingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  freeBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  freeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  freeShipping: {
    color: '#27ae60',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#c568f2',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c568f2',
    paddingVertical: 16,
    borderRadius: 50,
    marginTop: 15,
    gap: 10,
    shadowColor: '#c568f2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c568f2',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 50,
    gap: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});