import { API } from "@/constants/api";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
type ServiceType = "GROOMING" | "CONSULTATION" | "VACCINE";

type DashboardCards = {
  totalUsers: number;
  totalAdmins: number;
  totalPets: number;
  totalActiveServices: number;
  totalActiveProducts: number;
  totalAppointments: number;
  appointmentsToday: number;
};

type AppointmentsByStatus = {
  PENDING: number;
  CONFIRMED: number;
  CANCELLED: number;
  COMPLETED: number;
};

type UpcomingAppointment = {
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

type LowStockProduct = {
  id: string;
  name: string;
  stock: number;
  price: number;
  imageUrl?: string | null;
  category: "ACCESSORY" | "FOOD" | "TOY";
};

type RecentUser = {
  id: string;
  name: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  role: "ADMIN" | "USER";
};

type DashboardResponse = {
  cards: DashboardCards;
  appointmentsByStatus: AppointmentsByStatus;
  upcomingAppointments: UpcomingAppointment[];
  lowStockProducts: LowStockProduct[];
  recentUsers: RecentUser[];
};

export default function AdminHome() {
  const router = useRouter();

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(
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

        const res = await API.get<DashboardResponse>("/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(res.data);
      } catch (err: any) {
        console.log(
          "getDashboard error:",
          err?.response?.data || err.message
        );
        Alert.alert(
          "Error",
          err?.response?.data?.message ||
            "No se pudo cargar el panel. Intenta nuevamente."
        );
      } finally {
        if (isRefreshing) setRefreshing(false);
        else setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = () => {
    fetchDashboard(true);
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

  const mapProductCategory = (c: LowStockProduct["category"]) => {
    switch (c) {
      case "FOOD":
        return "Alimentos";
      case "TOY":
        return "Juguetes";
      case "ACCESSORY":
        return "Accesorios";
      default:
        return c;
    }
  };

  const getStatusChipConfig = (status: AppointmentStatus) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pendientes",
          color: "#3498db",
          icon: "schedule",
        };
      case "CONFIRMED":
        return {
          label: "Confirmadas",
          color: "#27ae60",
          icon: "event-available",
        };
      case "COMPLETED":
        return {
          label: "Completadas",
          color: "#8e44ad",
          icon: "check-circle",
        };
      case "CANCELLED":
        return {
          label: "Canceladas",
          color: "#e74c3c",
          icon: "cancel",
        };
    }
  };

  if (loading && !data) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#c568f2" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Text style={{ textAlign: "center", color: "#666", paddingHorizontal: 20 }}>
          No se pudo cargar el panel.
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { marginTop: 16 }]}
          onPress={() => fetchDashboard()}
        >
          <MaterialIcons name="refresh" size={18} color="#fff" />
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { cards, appointmentsByStatus, upcomingAppointments, lowStockProducts, recentUsers } =
    data;

  return (
    <View style={styles.container}>
      {/* Header simple dentro del contenido */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#c568f2"]}
          />
        }
      >
        {/* Encabezado */}
        <View style={styles.headerSection}>
          {/* <Text style={styles.title}>Panel administrador</Text> */}
          <Text style={styles.subtitle}>
            Resumen general de la veterinaria
          </Text>
        </View>

        {/* KPIs principales */}
        <View style={styles.cardsGrid}>
          <KpiCard
            icon="group"
            label="Usuarios"
            value={cards.totalUsers}
            accent="#3498db"
          />
          <KpiCard
            icon="admin-panel-settings"
            label="Admins"
            value={cards.totalAdmins}
            accent="#e67e22"
          />
          <KpiCard
            icon="pets"
            label="Mascotas"
            value={cards.totalPets}
            accent="#c568f2"
          />
          <KpiCard
            icon="medical-services"
            label="Servicios activos"
            value={cards.totalActiveServices}
            accent="#2ecc71"
          />
          <KpiCard
            icon="shopping-bag"
            label="Productos activos"
            value={cards.totalActiveProducts}
            accent="#9b59b6"
          />
          <KpiCard
            icon="event"
            label="Citas totales"
            value={cards.totalAppointments}
            accent="#1abc9c"
          />
          <KpiCard
            icon="event-available"
            label="Citas hoy"
            value={cards.appointmentsToday}
            accent="#f39c12"
          />
        </View>

        {/* Resumen de estados de citas */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Estado de citas</Text>
            <TouchableOpacity
              onPress={() => router.push("/(admin)/citas" as any)}
            >
              <Text style={styles.sectionLink}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusChipsRow}>
            {(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as AppointmentStatus[]).map(
              (st) => {
                const cfg = getStatusChipConfig(st);
                const count = appointmentsByStatus[st];
                return (
                  <View
                    key={st}
                    style={[styles.statusChip, { borderColor: cfg.color }]}
                  >
                    <MaterialIcons
                      name={cfg.icon as any}
                      size={18}
                      color={cfg.color}
                    />
                    <View style={{ marginLeft: 6 }}>
                      <Text style={[styles.statusChipLabel, { color: cfg.color }]}>
                        {cfg.label}
                      </Text>
                      <Text style={styles.statusChipValue}>{count}</Text>
                    </View>
                  </View>
                );
              }
            )}
          </View>
        </View>

        {/* Próximas citas */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximas citas</Text>
            <TouchableOpacity
              onPress={() => router.push("/(admin)/citas" as any)}
            >
              <Text style={styles.sectionLink}>Ver agenda</Text>
            </TouchableOpacity>
          </View>

          {upcomingAppointments.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay próximas citas programadas.
            </Text>
          ) : (
            upcomingAppointments.map((appt) => {
              const { date, time } = formatDateTime(appt.date);
              return (
                <TouchableOpacity
                  key={appt.id}
                  style={styles.appointmentItem}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: "/(admin)/citas/detalle",
                      params: { id: appt.id },
                    } as any)
                  }
                >
                  <View style={styles.appointmentIconBox}>
                    <MaterialIcons name="event" size={22} color="#c568f2" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.appointmentTitle}>
                      {appt.pet.name} · {appt.service.name}
                    </Text>
                    <Text style={styles.appointmentSubtitle}>
                      {appt.user.name} {appt.user.lastname} ·{" "}
                      {mapServiceTypeLabel(appt.service.type)}
                    </Text>
                    <View style={styles.appointmentMetaRow}>
                      <View style={styles.appointmentMetaItem}>
                        <MaterialIcons
                          name="calendar-today"
                          size={16}
                          color="#777"
                        />
                        <Text style={styles.appointmentMetaText}>{date}</Text>
                      </View>
                      <View style={styles.appointmentMetaItem}>
                        <MaterialIcons
                          name="access-time"
                          size={16}
                          color="#777"
                        />
                        <Text style={styles.appointmentMetaText}>{time} hrs</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Productos con poco stock */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos con poco stock</Text>
            <TouchableOpacity
              onPress={() => router.push("/(admin)/productos" as any)}
            >
              <Text style={styles.sectionLink}>Gestionar</Text>
            </TouchableOpacity>
          </View>

          {lowStockProducts.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay productos con stock crítico.
            </Text>
          ) : (
            lowStockProducts.map((p) => (
              <View key={p.id} style={styles.productRow}>
                <View style={styles.productIconBox}>
                  <MaterialIcons name="inventory-2" size={20} color="#c568f2" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={styles.productCategory}>
                    {mapProductCategory(p.category)}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.productPrice}>
                    s/ {Number(p.price).toFixed(2)}
                  </Text>
                  <Text style={styles.productStock}>Stock: {p.stock}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Últimos usuarios */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos usuarios</Text>
          </View>

          {recentUsers.length === 0 ? (
            <Text style={styles.emptyText}>Aún no hay usuarios registrados.</Text>
          ) : (
            recentUsers.map((u) => {
              const created = new Date(u.createdAt);
              const date = `${String(created.getDate()).padStart(2, "0")}/${String(
                created.getMonth() + 1
              ).padStart(2, "0")}/${created.getFullYear()}`;

              const isAdmin = u.role === "ADMIN";

              return (
                <View key={u.id} style={styles.userRow}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {(u.name?.[0] || "U").toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>
                      {u.name} {u.lastname}
                    </Text>
                    <Text style={styles.userEmail}>{u.email}</Text>
                    <Text style={styles.userPhone}>{u.phoneNumber}</Text>
                  </View>
                  <View style={styles.userMeta}>
                    <Text style={styles.userDate}>{date}</Text>
                    <View
                      style={[
                        styles.roleBadge,
                        isAdmin ? styles.roleAdmin : styles.roleUser,
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleBadgeText,
                          isAdmin && { color: "#fff" },
                        ]}
                      >
                        {isAdmin ? "ADMIN" : "USER"}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Tarjeta pequeña para KPI
 */
function KpiCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <View style={styles.kpiCard}>
      <View style={[styles.kpiIconBox, { backgroundColor: `${accent}20` }]}>
        <MaterialIcons name={icon} size={22} color={accent} />
      </View>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
  },
  headerSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#c568f2",
  },
  statusChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  statusChipLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusChipValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },
  emptyText: {
    fontSize: 13,
    color: "#999",
  },
  appointmentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  appointmentIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f7eaff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  appointmentTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  appointmentSubtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  appointmentMetaRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 4,
  },
  appointmentMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  appointmentMetaText: {
    fontSize: 12,
    color: "#777",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f7eaff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  productCategory: {
    fontSize: 11,
    color: "#999",
  },
  productPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#c568f2",
  },
  productStock: {
    fontSize: 11,
    color: "#e67e22",
    marginTop: 2,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#c568f2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  userAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  userEmail: {
    fontSize: 11,
    color: "#777",
  },
  userPhone: {
    fontSize: 11,
    color: "#777",
    marginTop: 2,
  },
  userMeta: {
    alignItems: "flex-end",
  },
  userDate: {
    fontSize: 11,
    color: "#999",
    marginBottom: 4,
  },
  roleBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
  },
  roleAdmin: {
    backgroundColor: "#c568f2",
    borderColor: "#c568f2",
  },
  roleUser: {
    borderColor: "#999",
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#555",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c568f2",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "center",
    gap: 6,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});
