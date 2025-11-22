import { API } from "@/constants/api";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type ServiceType = "GROOMING" | "CONSULTATION" | "VACCINE";
type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

type AdminAppointment = {
  id: string;
  date: string; // ISO
  status: AppointmentStatus;
  reason?: string | null;
  user: {
    id: string;
    name: string;
    lastname: string;
    email: string;
    phoneNumber: string;
  };
  pet: {
    id: string;
    name: string;
    species: string;
  };
  service: {
    id: string;
    name: string;
    type: ServiceType;
  };
};

type FilterKey = "ALL" | AppointmentStatus;

const FILTERS: { key: FilterKey; label: string; icon: string }[] = [
  { key: "ALL", label: "Todas", icon: "list" },
  { key: "PENDING", label: "Pendientes", icon: "schedule" },
  { key: "CONFIRMED", label: "Confirmadas", icon: "event-available" },
  { key: "COMPLETED", label: "Completadas", icon: "check-circle" },
  { key: "CANCELLED", label: "Canceladas", icon: "cancel" },
];

export default function AdminCitasScreen() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getStatusConfig = (status: AppointmentStatus) => {
    switch (status) {
      case "PENDING":
        return {
          color: "#3498db",
          bgColor: "#e8f4fd",
          icon: "schedule",
          label: "Pendiente",
        };
      case "CONFIRMED":
        return {
          color: "#27ae60",
          bgColor: "#e8f8f0",
          icon: "event-available",
          label: "Confirmada",
        };
      case "COMPLETED":
        return {
          color: "#8e44ad",
          bgColor: "#f5e8ff",
          icon: "check-circle",
          label: "Completada",
        };
      case "CANCELLED":
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
          label: status,
        };
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { date: "-", time: "-" };

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`,
    };
  };

  const fetchAppointments = useCallback(
    async (isRefreshing = false) => {
      try {
        if (isRefreshing) setRefreshing(true);
        else setLoading(true);

        const token = await useAuth.getToken();
        if (!token) {
          await useAuth.clearSession();
          router.replace("/(auth)" as never);
          return;
        }

        const params: any = {};
        if (activeFilter !== "ALL") {
          params.status = activeFilter;
        }

        const res = await API.get<AdminAppointment[]>("/appointments", {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });

        setAppointments(res.data);
      } catch (err: any) {
        console.log(
          "getAllAppointments error:",
          err?.response?.data || err.message
        );
        Alert.alert(
          "Error",
          err?.response?.data?.message ||
            "No se pudieron cargar las citas. Intenta nuevamente."
        );
      } finally {
        if (isRefreshing) setRefreshing(false);
        else setLoading(false);
      }
    },
    [activeFilter, router]
  );

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const onRefresh = () => {
    fetchAppointments(true);
  };

  const handleChangeStatus = async (
    appointmentId: string,
    newStatus: AppointmentStatus
  ) => {
    Alert.alert(
      "Cambiar estado",
      `¿Seguro que quieres marcar la cita como "${
        getStatusConfig(newStatus).label
      }"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              setUpdatingId(appointmentId);
              const token = await useAuth.getToken();
              if (!token) {
                await useAuth.clearSession();
                router.replace("/(auth)" as never);
                return;
              }

              await API.patch(
                `/appointments/${appointmentId}/status`,
                { status: newStatus },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              // actualizamos en memoria
              setAppointments((prev) =>
                prev.map((a) =>
                  a.id === appointmentId ? { ...a, status: newStatus } : a
                )
              );
            } catch (err: any) {
              console.log(
                "updateAppointmentStatus error:",
                err?.response?.data || err.message
              );
              Alert.alert(
                "Error",
                err?.response?.data?.message ||
                  "No se pudo cambiar el estado de la cita."
              );
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  const mapServiceTypeLabel = (t: ServiceType) => {
    switch (t) {
      case "GROOMING":
        return "Grooming";
      case "CONSULTATION":
        return "Consulta";
      case "VACCINE":
        return "Vacuna";
      default:
        return t;
    }
  };

  const renderAppointment = ({ item }: { item: AdminAppointment }) => {
    const statusCfg = getStatusConfig(item.status);
    const { date, time } = formatDateTime(item.date);
    const isUpdating = updatingId === item.id;

    // Acciones disponibles según estado
    const canConfirm = item.status === "PENDING";
    const canComplete = item.status === "CONFIRMED";
    const canCancel =
      item.status === "PENDING" || item.status === "CONFIRMED";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
            router.push({
              pathname: "/(admin)/citas/detalle",
              params: { id: item.id },
            } as any)
          }
      >
        {/* Barra lateral de estado */}
        <View
          style={[styles.statusBar, { backgroundColor: statusCfg.color }]}
        />

        <View style={styles.cardContent}>
          {/* Header: mascota + estado */}
          <View style={styles.cardHeader}>
            <View style={styles.petInfo}>
              <MaterialIcons name="pets" size={20} color="#c568f2" />
              <View>
                <Text style={styles.petName}>{item.pet.name}</Text>
                <Text style={styles.petSpecies}>{item.pet.species}</Text>
              </View>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusCfg.bgColor },
              ]}
            >
              <MaterialIcons
                name={statusCfg.icon as any}
                size={14}
                color={statusCfg.color}
              />
              <Text
                style={[styles.statusText, { color: statusCfg.color }]}
              >
                {statusCfg.label}
              </Text>
            </View>
          </View>

          {/* Servicio */}
          <Text style={styles.serviceName}>{item.service.name}</Text>
          <Text style={styles.serviceType}>
            {mapServiceTypeLabel(item.service.type)}
          </Text>

          {/* Cliente */}
          <View style={styles.userRow}>
            <MaterialIcons name="person" size={18} color="#999" />
            <View style={{ marginLeft: 6, flex: 1 }}>
              <Text style={styles.userName}>
                {item.user.name} {item.user.lastname}
              </Text>
              <Text style={styles.userContact}>
                {item.user.phoneNumber} · {item.user.email}
              </Text>
            </View>
          </View>

          {/* Fecha / hora */}
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
              <MaterialIcons name="calendar-today" size={18} color="#666" />
              <Text style={styles.dateTimeText}>{date}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <MaterialIcons name="access-time" size={18} color="#666" />
              <Text style={styles.dateTimeText}>{time} hrs</Text>
            </View>
          </View>

          {/* Motivo */}
          {item.reason && (
            <Text style={styles.reasonText} numberOfLines={2}>
              Motivo: {item.reason}
            </Text>
          )}

          {/* Acciones admin */}
          <View style={styles.actionsRow}>
            {isUpdating ? (
              <ActivityIndicator size="small" color="#c568f2" />
            ) : (
              <>
                {canConfirm && (
                  <TouchableOpacity
                    style={[styles.actionChip, styles.confirmChip]}
                    onPress={() =>
                      handleChangeStatus(item.id, "CONFIRMED")
                    }
                  >
                    <MaterialIcons
                      name="event-available"
                      size={16}
                      color="#fff"
                    />
                    <Text style={styles.actionChipText}>Confirmar</Text>
                  </TouchableOpacity>
                )}

                {canComplete && (
                  <TouchableOpacity
                    style={[styles.actionChip, styles.completeChip]}
                    onPress={() =>
                      handleChangeStatus(item.id, "COMPLETED")
                    }
                  >
                    <MaterialIcons
                      name="check-circle"
                      size={16}
                      color="#fff"
                    />
                    <Text style={styles.actionChipText}>Marcar completada</Text>
                  </TouchableOpacity>
                )}

                {canCancel && (
                  <TouchableOpacity
                    style={[styles.actionChip, styles.cancelChip]}
                    onPress={() =>
                      handleChangeStatus(item.id, "CANCELLED")
                    }
                  >
                    <MaterialIcons name="cancel" size={16} color="#e74c3c" />
                    <Text style={styles.cancelChipText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
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
      {/* Header admin simple */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Citas (Admin)</Text>
        <Text style={styles.headerSubtitle}>
          {appointments.length}{" "}
          {appointments.length === 1 ? "cita" : "citas"} encontradas
        </Text>
      </View> */}

      {/* Filtros de estado */}
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderAppointment}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#c568f2"]}
          />
        }
        ListHeaderComponent={
          <View style={styles.filtersScroll}>
            <FlatList
              data={FILTERS}
              keyExtractor={(f) => f.key}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    activeFilter === item.key && styles.filterChipActive,
                  ]}
                  onPress={() => setActiveFilter(item.key)}
                >
                  <MaterialIcons
                    name={item.icon as any}
                    size={18}
                    color={activeFilter === item.key ? "#fff" : "#666"}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === item.key && styles.filterTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-busy" size={80} color="#ddd" />
            <Text style={styles.emptyTitle}>No hay citas</Text>
            <Text style={styles.emptySubtitle}>
              Prueba con otro filtro o espera nuevas reservas.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#999",
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  filtersScroll: {
    paddingVertical: 10,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: "#c568f2",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statusBar: {
    width: 5,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  petInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  petName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  petSpecies: {
    fontSize: 12,
    color: "#999",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  serviceType: {
    fontSize: 12,
    color: "#999",
    marginBottom: 6,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  userName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  userContact: {
    fontSize: 11,
    color: "#777",
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 4,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateTimeText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  reasonText: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  confirmChip: {
    backgroundColor: "#27ae60",
  },
  completeChip: {
    backgroundColor: "#8e44ad",
  },
  cancelChip: {
    backgroundColor: "#fdeaea",
  },
  actionChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  cancelChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#e74c3c",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
