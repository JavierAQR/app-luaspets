import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Datos temporales de citas
const CITAS_DATA: Cita[] = [
  {
    id: 1,
    mascota: "Max",
    servicio: "Consulta general",
    fecha: "2024-11-15",
    hora: "10:00",
    estado: "programada",
    veterinario: "Dr. García",
    motivo: "Revisión de rutina",
  },
  {
    id: 2,
    mascota: "Luna",
    servicio: "Vacunación",
    fecha: "2024-11-18",
    hora: "15:30",
    estado: "programada",
    veterinario: "Dra. Martínez",
    motivo: "Vacuna antirrábica",
  },
  {
    id: 3,
    mascota: "Rocky",
    servicio: "Baño y corte",
    fecha: "2024-11-12",
    hora: "11:00",
    estado: "completada",
    veterinario: "Personal de grooming",
    motivo: "Grooming completo",
  },
  {
    id: 4,
    mascota: "Michi",
    servicio: "Consulta especializada",
    fecha: "2024-11-10",
    hora: "09:00",
    estado: "completada",
    veterinario: "Dr. López",
    motivo: "Problemas digestivos",
  },
  {
    id: 5,
    mascota: "Max",
    servicio: "Control veterinario",
    fecha: "2024-11-08",
    hora: "14:00",
    estado: "cancelada",
    veterinario: "Dr. García",
    motivo: "Chequeo general",
  },
];

type Cita = {
  id: number;
  mascota: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: "programada" | "completada" | "cancelada";
  veterinario: string;
  motivo: string;
};

type FilterType = "todas" | "programada" | "completada" | "cancelada";

export default function CitasScreen() {
//   const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>("todas");

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case "programada":
        return {
          color: "#3498db",
          bgColor: "#e8f4fd",
          icon: "schedule",
          label: "Programada",
        };
      case "completada":
        return {
          color: "#27ae60",
          bgColor: "#e8f8f0",
          icon: "check-circle",
          label: "Completada",
        };
      case "cancelada":
        return {
          color: "#e74c3c",
          bgColor: "#fdeaea",
          icon: "cancel",
          label: "Cancelada",
        };
      default:
        return {
          color: "#999",
          bgColor: "#f5f5f5",
          icon: "help",
          label: estado,
        };
    }
  };

  const formatearFecha = (fecha: string) => {
    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const [, month, day] = fecha.split("-");
    return `${day} ${meses[parseInt(month) - 1]}`;
  };

  const filteredCitas =
    activeFilter === "todas"
      ? CITAS_DATA
      : CITAS_DATA.filter((cita) => cita.estado === activeFilter);

  const renderCitaCard = ({ item }: { item: Cita }) => {
    const estadoConfig = getEstadoConfig(item.estado);
    const isProgramada = item.estado === "programada";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          console.log("Ver detalles de cita:", item.id);
        }}
      >
        {/* Barra lateral de color según estado */}
        <View
          style={[styles.statusBar, { backgroundColor: estadoConfig.color }]}
        />

        <View style={styles.cardContent}>
          {/* Header de la card */}
          <View style={styles.cardHeader}>
            <View style={styles.petInfo}>
              <MaterialIcons name="pets" size={20} color="#c568f2" />
              <Text style={styles.petName}>{item.mascota}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: estadoConfig.bgColor },
              ]}
            >
              <MaterialIcons
                name={estadoConfig.icon as any}
                size={14}
                color={estadoConfig.color}
              />
              <Text style={[styles.statusText, { color: estadoConfig.color }]}>
                {estadoConfig.label}
              </Text>
            </View>
          </View>

          {/* Servicio */}
          <Text style={styles.serviceName}>{item.servicio}</Text>
          <Text style={styles.motivo}>{item.motivo}</Text>

          {/* Fecha y hora */}
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeItem}>
              <MaterialIcons name="calendar-today" size={18} color="#666" />
              <Text style={styles.dateTimeText}>
                {formatearFecha(item.fecha)}
              </Text>
            </View>
            <View style={styles.dateTimeItem}>
              <MaterialIcons name="access-time" size={18} color="#666" />
              <Text style={styles.dateTimeText}>{item.hora}</Text>
            </View>
          </View>

          {/* Veterinario */}
          <View style={styles.vetInfo}>
            <MaterialIcons name="person" size={18} color="#999" />
            <Text style={styles.vetName}>{item.veterinario}</Text>
          </View>

          {/* Acciones para citas programadas */}
          {isProgramada && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="edit" size={18} color="#c568f2" />
                <Text style={styles.actionText}>Modificar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
              >
                <MaterialIcons name="close" size={18} color="#e74c3c" />
                <Text style={[styles.actionText, styles.cancelText]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const filters: { key: FilterType; label: string; icon: string }[] = [
    { key: "todas", label: "Todas", icon: "list" },
    { key: "programada", label: "Próximas", icon: "schedule" },
    { key: "completada", label: "Completadas", icon: "check-circle" },
    { key: "cancelada", label: "Canceladas", icon: "cancel" },
  ];

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mis Citas</Text>
          <Text style={styles.subtitle}>
            {filteredCitas.length}{" "}
            {filteredCitas.length === 1 ? "cita" : "citas"}
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
                color={activeFilter === filter.key ? "#fff" : "#666"}
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

      {/* Lista de citas */}
      {filteredCitas.length > 0 ? (
        <FlatList
          data={filteredCitas}
          renderItem={renderCitaCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="event-busy" size={80} color="#ddd" />
          <Text style={styles.emptyTitle}>
            No hay citas {activeFilter !== "todas" ? `${activeFilter}s` : ""}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeFilter === "todas"
              ? "Agenda tu primera cita veterinaria"
              : "Intenta con otro filtro"}
          </Text>
        </View>
      )}

      {/* Botón flotante para agendar */}
      <TouchableOpacity
        style={styles.fabButton}
        activeOpacity={0.8}
        onPress={() => {
          console.log("Agendar nueva cita");
        }}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
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
    fontWeight: "700",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: "#999",
    fontWeight: "600",
  },
  filtersScroll: {
    marginTop: 10,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#f8f8f8",
    marginRight: 10,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: "#c568f2",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
  },
  statusBar: {
    width: 5,
  },
  cardContent: {
    flex: 1,
    padding: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  petInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  petName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  motivo: {
    fontSize: 14,
    color: "#999",
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 12,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateTimeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  vetInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  vetName: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
    gap: 6,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fdeaea",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#c568f2",
  },
  cancelText: {
    color: "#e74c3c",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
  },
  fabButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#c568f2",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#c568f2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
