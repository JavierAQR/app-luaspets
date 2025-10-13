import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Datos temporales de compras
const COMPRAS_DATA: Compra[] = [
  {
    id: 1,
    orderNumber: 'ORD-2025-001',
    fecha: '2025-09-10',
    estado: 'entregado',
    total: 127.50,
    productos: [
      { nombre: 'Dog Chow Adulto 5kg', cantidad: 2, precio: 45 },
      { nombre: 'Pelota de goma', cantidad: 1, precio: 15 },
      { nombre: 'Collar antipulgas', cantidad: 1, precio: 22.50 },
    ],
  },
  {
    id: 2,
    orderNumber: 'ORD-2025-002',
    fecha: '2025-09-12',
    estado: 'en_camino',
    total: 95.00,
    productos: [
      { nombre: 'Cat Chow Gatitos 3kg', cantidad: 2, precio: 38 },
      { nombre: 'Ratón de peluche', cantidad: 1, precio: 12 },
      { nombre: 'Arena sanitaria', cantidad: 1, precio: 7 },
    ],
  },
  {
    id: 3,
    orderNumber: 'ORD-2025-003',
    fecha: '2025-09-14',
    estado: 'pendiente',
    total: 158.00,
    productos: [
      { nombre: 'Ricocan Premium 10kg', cantidad: 2, precio: 52 },
      { nombre: 'Cama acolchada', cantidad: 1, precio: 65 },
      { nombre: 'Plato de cerámica', cantidad: 2, precio: 22 },
    ],
  },
  {
    id: 4,
    orderNumber: 'ORD-2025-004',
    fecha: '2025-09-08',
    estado: 'entregado',
    total: 85.00,
    productos: [
      { nombre: 'Transportadora', cantidad: 1, precio: 85 },
    ],
  },
  {
    id: 5,
    orderNumber: 'ORD-2025-005',
    fecha: '2025-09-05',
    estado: 'cancelado',
    total: 67.00,
    productos: [
      { nombre: 'Whiskas Adulto', cantidad: 1, precio: 35 },
      { nombre: 'Cuerda para jalar', cantidad: 1, precio: 18 },
      { nombre: 'Láser para gatos', cantidad: 1, precio: 14 },
    ],
  },
];

type Compra = {
  id: number;
  orderNumber: string;
  fecha: string;
  estado: 'pendiente' | 'en_camino' | 'entregado' | 'cancelado';
  total: number;
  productos: { nombre: string; cantidad: number; precio: number }[];
};

type FilterType = 'todas' | 'pendiente' | 'en_camino' | 'entregado' | 'cancelado';

export default function ComprasScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return {
          color: '#f39c12',
          bgColor: '#fef5e7',
          icon: 'pending',
          label: 'Pendiente',
        };
      case 'en_camino':
        return {
          color: '#3498db',
          bgColor: '#e8f4fd',
          icon: 'local-shipping',
          label: 'En camino',
        };
      case 'entregado':
        return {
          color: '#27ae60',
          bgColor: '#e8f8f0',
          icon: 'check-circle',
          label: 'Entregado',
        };
      case 'cancelado':
        return {
          color: '#e74c3c',
          bgColor: '#fdeaea',
          icon: 'cancel',
          label: 'Cancelado',
        };
      default:
        return {
          color: '#999',
          bgColor: '#f5f5f5',
          icon: 'help',
          label: estado,
        };
    }
  };

  const formatearFecha = (fecha: string) => {
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    const [year, month, day] = fecha.split('-');
    return `${day} ${meses[parseInt(month) - 1]}, ${year}`;
  };

  const filteredCompras = activeFilter === 'todas' 
    ? COMPRAS_DATA 
    : COMPRAS_DATA.filter(compra => compra.estado === activeFilter);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderCompraCard = ({ item }: { item: Compra }) => {
    const estadoConfig = getEstadoConfig(item.estado);
    const isExpanded = expandedId === item.id;
    const canCancel = item.estado === 'pendiente';
    const canTrack = item.estado === 'en_camino';

    return (
      <View style={styles.card}>
        {/* Header de la card */}
        <TouchableOpacity 
          style={styles.cardHeader}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <View style={styles.orderNumberContainer}>
              <MaterialIcons name="receipt" size={20} color="#c568f2" />
              <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            </View>
            <Text style={styles.fecha}>{formatearFecha(item.fecha)}</Text>
          </View>
          
          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, { backgroundColor: estadoConfig.bgColor }]}>
              <MaterialIcons name={estadoConfig.icon as any} size={14} color={estadoConfig.color} />
              <Text style={[styles.statusText, { color: estadoConfig.color }]}>
                {estadoConfig.label}
              </Text>
            </View>
            <MaterialIcons 
              name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color="#999" 
            />
          </View>
        </TouchableOpacity>

        {/* Resumen */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <MaterialIcons name="shopping-bag" size={18} color="#999" />
            <Text style={styles.summaryText}>
              {item.productos.length} {item.productos.length === 1 ? 'producto' : 'productos'}
            </Text>
          </View>
          <Text style={styles.totalAmount}>s/ {item.total.toFixed(2)}</Text>
        </View>

        {/* Detalle expandible */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            
            <Text style={styles.productsTitle}>Productos:</Text>
            {item.productos.map((producto, index) => (
              <View key={index} style={styles.productoItem}>
                <View style={styles.productoInfo}>
                  <Text style={styles.productoNombre}>{producto.nombre}</Text>
                  <Text style={styles.productoCantidad}>x{producto.cantidad} </Text>
                </View>
                <Text style={styles.productoPrecio}>s/ {producto.precio.toFixed(2)}</Text>
              </View>
            ))}

            {/* Acciones */}
            <View style={styles.actionsContainer}>
              {canTrack && (
                <TouchableOpacity style={styles.trackButton}>
                  <MaterialIcons name="local-shipping" size={18} color="#fff" />
                  <Text style={styles.trackButtonText}>Rastrear pedido</Text>
                </TouchableOpacity>
              )}
              
              {canCancel && (
                <TouchableOpacity style={styles.cancelButton}>
                  <MaterialIcons name="close" size={18} color="#e74c3c" />
                  <Text style={styles.cancelButtonText}>Cancelar pedido</Text>
                </TouchableOpacity>
              )}

              {item.estado === 'entregado' && (
                <TouchableOpacity style={styles.reorderButton}>
                  <MaterialIcons name="refresh" size={18} color="#c568f2" />
                  <Text style={styles.reorderButtonText}>Volver a comprar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const filters: { key: FilterType; label: string; icon: string }[] = [
    { key: 'todas', label: 'Todas', icon: 'list' },
    { key: 'pendiente', label: 'Pendientes', icon: 'pending' },
    { key: 'en_camino', label: 'En camino', icon: 'local-shipping' },
    { key: 'entregado', label: 'Entregadas', icon: 'check-circle' },
    { key: 'cancelado', label: 'Canceladas', icon: 'cancel' },
  ];

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mis Compras</Text>
          <Text style={styles.subtitle}>
            {filteredCompras.length} {filteredCompras.length === 1 ? 'pedido' : 'pedidos'}
          </Text>
        </View>

        {/* Filtros */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                activeFilter === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <MaterialIcons 
                name={filter.icon as any} 
                size={18} 
                color={activeFilter === filter.key ? '#fff' : '#666'} 
              />
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de compras */}
      {filteredCompras.length > 0 ? (
        <FlatList
          data={filteredCompras}
          renderItem={renderCompraCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="shopping-basket" size={80} color="#ddd" />
          <Text style={styles.emptyTitle}>
            No hay compras {activeFilter !== 'todas' ? `${activeFilter}s` : ''}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeFilter === 'todas' 
              ? 'Realiza tu primera compra'
              : 'Intenta con otro filtro'}
          </Text>
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
  headerSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: '#999',
    fontWeight: '600',
  },
  filtersScroll: {
    marginTop: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#f8f8f8',
    marginRight: 10,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#c568f2',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  headerLeft: {
    flex: 1,
  },
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  fecha: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#c568f2',
  },
  expandedContent: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
  },
  productsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  productoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  productoInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  productoNombre: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  productoCantidad: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  productoPrecio: {
    fontSize: 14,
    color: '#666',
    fontWeight: '700',
  },
  actionsContainer: {
    marginTop: 15,
    gap: 10,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c568f2',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fdeaea',
  },
  cancelButtonText: {
    color: '#e74c3c',
    fontSize: 15,
    fontWeight: '700',
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  reorderButtonText: {
    color: '#c568f2',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
});