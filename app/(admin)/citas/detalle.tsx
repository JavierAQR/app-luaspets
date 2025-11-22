// app/(admin)/citas/detalle.tsx
import { API } from "@/constants/api";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type ServiceType = "GROOMING" | "CONSULTATION" | "VACCINE";
type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

type AdminAppointmentDetail = {
  id: string;
  date: string; // ISO
  status: AppointmentStatus;
  reason?: string | null;
  notes?: string | null;
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
    price: number;
    durationMin?: number | null;
  };
};

export default function AdminDetalleCitaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const appointmentId = id as string | undefined;

  const [appointment, setAppointment] = useState<AdminAppointmentDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<AppointmentStatus | null>(
    null
  );

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) {
        Alert.alert("Error", "No se encontró el identificador de la cita.");
        router.back();
        return;
      }

      try {
        setLoading(true);
        const token = await useAuth.getToken();
        if (!token) {
          await useAuth.clearSession();
          router.replace("/(auth)" as never);
          return;
        }

        const res = await API.get<AdminAppointmentDetail>(
          `/appointments/${appointmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setAppointment(res.data);
      } catch (err: any) {
        console.log(
          "getAppointmentById (admin) error:",
          err?.response?.data || err.message
        );
        Alert.alert(
          "Error",
          err?.response?.data?.message || "No se pudo cargar la cita."
        );
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, router]);

  const getStatusConfig = (status: AppointmentStatus) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pendiente",
          color: "#3498db",
          bg: "#e8f4fd",
          icon: "schedule",
        };
      case "CONFIRMED":
        return {
          label: "Confirmada",
          color: "#27ae60",
          bg: "#e8f8f0",
          icon: "event-available",
        };
      case "COMPLETED":
        return {
          label: "Completada",
          color: "#8e44ad",
          bg: "#f5e8ff",
          icon: "check-circle",
        };
      case "CANCELLED":
        return {
          label: "Cancelada",
          color: "#e74c3c",
          bg: "#fdeaea",
          icon: "cancel",
        };
      default:
        return {
          label: status,
          color: "#999",
          bg: "#f5f5f5",
          icon: "help",
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

  const handleChangeStatus = (newStatus: AppointmentStatus) => {
    if (!appointment) return;
    if (appointment.status === newStatus) return;

    Alert.alert(
      "Cambiar estado",
      `¿Quieres marcar esta cita como "${getStatusConfig(newStatus).label}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              setUpdatingStatus(newStatus);
              const token = await useAuth.getToken();
              if (!token) {
                await useAuth.clearSession();
                router.replace("/(auth)" as never);
                return;
              }

              await API.patch(
                `/appointments/${appointment.id}/status`,
                { status: newStatus },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              setAppointment((prev) =>
                prev ? { ...prev, status: newStatus } : prev
              );
            } catch (err: any) {
              console.log(
                "updateAppointmentStatus (admin) error:",
                err?.response?.data || err.message
              );
              Alert.alert(
                "Error",
                err?.response?.data?.message ||
                  "No se pudo actualizar el estado de la cita."
              );
            } finally {
              setUpdatingStatus(null);
            }
          },
        },
      ]
    );
  };

  if (loading || !appointment) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#c568f2" />
      </View>
    );
  }

  const statusCfg = getStatusConfig(appointment.status);
  const { date, time } = formatDateTime(appointment.date);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de cita (Admin)</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Estado y fecha/hora */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View
              style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}
            >
              <MaterialIcons
                name={statusCfg.icon as any}
                size={18}
                color={statusCfg.color}
              />
              <Text
                style={[styles.statusText, { color: statusCfg.color }]}
              >
                {statusCfg.label}
              </Text>
            </View>
            <Text style={styles.appointmentId}>ID: {appointment.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="calendar-today" size={20} color="#666" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.label}>Fecha</Text>
              <Text style={styles.value}>{date}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="access-time" size={20} color="#666" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.label}>Hora</Text>
              <Text style={styles.value}>{time} hrs</Text>
            </View>
          </View>
        </View>

        {/* Mascota */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mascota</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="pets" size={22} color="#c568f2" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.value}>{appointment.pet.name}</Text>
              <Text style={styles.subValue}>{appointment.pet.species}</Text>
            </View>
          </View>
        </View>

        {/* Servicio */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Servicio</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="medical-services" size={22} color="#c568f2" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.value}>{appointment.service.name}</Text>
              <Text style={styles.subValue}>
                {mapServiceTypeLabel(appointment.service.type)}
                {appointment.service.durationMin
                  ? ` · ${appointment.service.durationMin} min`
                  : ""}
              </Text>
            </View>
            <Text style={styles.price}>
              s/ {Number(appointment.service.price).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Cliente */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cliente</Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={20} color="#666" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.value}>
                {appointment.user.name} {appointment.user.lastname}
              </Text>
              <Text style={styles.subValue}>{appointment.user.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={20} color="#666" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.label}>Teléfono</Text>
              <Text style={styles.value}>{appointment.user.phoneNumber}</Text>
            </View>
          </View>
        </View>

        {/* Motivo y notas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detalles adicionales</Text>

          <View style={{ marginBottom: 12 }}>
            <Text style={styles.label}>Motivo</Text>
            <Text style={styles.value}>
              {appointment.reason || "Sin motivo especificado"}
            </Text>
          </View>

          {appointment.notes && (
            <View>
              <Text style={styles.label}>Notas internas / veterinario</Text>
              <Text style={styles.value}>{appointment.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Acciones de estado */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Cambiar estado</Text>
        <View style={styles.statusButtonsRow}>
          {(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as AppointmentStatus[]).map(
            (st) => {
              const cfg = getStatusConfig(st);
              const isCurrent = appointment.status === st;
              const isLoading = updatingStatus === st;

              return (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.statusButton,
                    isCurrent && { backgroundColor: cfg.color },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleChangeStatus(st)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={isCurrent ? "#fff" : cfg.color}
                    />
                  ) : (
                    <>
                      <MaterialIcons
                        name={cfg.icon as any}
                        size={16}
                        color={isCurrent ? "#fff" : cfg.color}
                      />
                      <Text
                        style={[
                          styles.statusButtonText,
                          isCurrent && { color: "#fff" },
                          !isCurrent && { color: cfg.color },
                        ]}
                      >
                        {cfg.label}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            }
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  appointmentId: {
    fontSize: 11,
    color: "#999",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 2,
  },
  subValue: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#c568f2",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  statusButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#f5f5f5",
    gap: 6,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
