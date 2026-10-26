"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import KantinCard from "@/components/KantinCard";
import MenuCard from "@/components/MenuCard";
import CategoryChips from "@/components/CategoryChips";
import FloatingCartBar from "@/components/FloatingCartBar";
import CartModal from "@/components/CartModal";
import OrderCard from "@/components/OrderCard";
import EmptyState from "@/components/EmptyState";
import LoginModal from "@/components/LoginModal";
import NotificationToast from "@/components/NotificationToast";
import NotificationDrawer from "@/components/NotificationDrawer";
import {
  subscribeKantin,
  subscribeMenu,
  subscribeCustomerOrders,
  createOrder,
} from "@/lib/firestore";
import {
  playNotificationSound,
  triggerVibration,
  requestNotificationPermission,
  sendBrowserNotification,
  getStoredNotifications,
  saveNotification,
  markAllNotificationsRead,
  clearAllNotifications,
} from "@/lib/notifications";
import { formatRupiah } from "@/lib/utils";
import {
  Flame,
  Utensils,
  Store,
  ChefHat,
  PackageOpen,
  ArrowLeft,
  GraduationCap,
  Bell,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("jajan"); // "jajan" | "pesanan"

  // Lazy initialize authentication from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const savedUser = localStorage.getItem("kon_auth_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [kantinList, setKantinList] = useState([]);
  const [selectedKantin, setSelectedKantin] = useState(null);
  const [allMenus, setAllMenus] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartKantinId, setCartKantinId] = useState(null);

  // Notifications State
  const [activeToast, setActiveToast] = useState(null);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    return getStoredNotifications(currentUser?.id || "guest");
  });
  const [notifPermission, setNotifPermission] = useState("default");

  // Customer orders stored by ID in browser
  const [customerOrderIds, setCustomerOrderIds] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("kon_customer_orders");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [customerOrders, setCustomerOrders] = useState([]);

  // Check auth user: if not logged in, redirect to /login
  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
    }
  }, [currentUser, router]);

  // Sync notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // Listen to storage/custom notification events to update notification list
  useEffect(() => {
    const handleUpdate = () => {
      setNotifications(getStoredNotifications(currentUser?.id || "guest"));
    };
    window.addEventListener("kon_notifications_updated", handleUpdate);
    return () => window.removeEventListener("kon_notifications_updated", handleUpdate);
  }, [currentUser?.id]);

  // Subscribe to Kantin list
  useEffect(() => {
    const unsub = subscribeKantin((list) => {
      setKantinList(list);
    });
    return () => unsub?.();
  }, []);

  // Subscribe to all menus to compute counts per canteen
  useEffect(() => {
    const unsub = subscribeMenu(null, (list) => {
      setAllMenus(list);
    });
    return () => unsub?.();
  }, []);

  // Subscribe to customer orders (by ID list or logged-in student ID)
  useEffect(() => {
    const unsub = subscribeCustomerOrders(customerOrderIds, currentUser?.id, (orders) => {
      setCustomerOrders(orders);
    });
    return () => unsub?.();
  }, [customerOrderIds, currentUser?.id]);

  // Order status transition tracking for real-time notifications
  const prevOrdersStatusRef = useRef({});
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (customerOrders.length === 0) return;

    if (isInitialLoadRef.current) {
      // First load: record initial statuses without blasting notifications
      const initialMap = {};
      customerOrders.forEach((o) => {
        initialMap[o.id] = o.status;
      });
      prevOrdersStatusRef.current = initialMap;
      isInitialLoadRef.current = false;
      return;
    }

    // Inspect orders for real-time status changes
    customerOrders.forEach((ord) => {
      const prevStatus = prevOrdersStatusRef.current[ord.id];
      const curStatus = ord.status;
      const kantin = kantinList.find((k) => String(k.id) === String(ord.kantin_id));
      const kantinName = kantin?.nama || "Kantin Sekolah";

      // 1. Pesanan Hampir Selesai / Siap Diambil / Sedang Diantar (Status 2)
      if (prevStatus !== undefined && prevStatus < 2 && curStatus === 2) {
        const isDelivery = Boolean(ord.opsi_antar);
        const title = isDelivery ? "Makanan Sedang Diantar!" : "Makanan Siap Diambil!";
        const message = isDelivery
          ? `Pesanan #${ord.id} di ${kantinName} sedang diantar menuju kelas ${ord.kelas || "kamu"}!`
          : `Pesanan #${ord.id} di ${kantinName} sudah siap diambil di kantin. Segera ke kantin ya!`;

        playNotificationSound("ready");
        triggerVibration([150, 80, 150]);
        sendBrowserNotification(title, { body: message, tag: `order-${ord.id}-ready` });

        const notifItem = {
          orderId: ord.id,
          status: 2,
          title,
          message,
          opsi_antar: isDelivery,
          kantin_id: ord.kantin_id,
          kantinName,
        };
        setActiveToast(notifItem);
        saveNotification(currentUser?.id || "guest", notifItem);
      }

      // 2. Pesanan Ditolak / Dibatalkan (Status 4)
      if (prevStatus !== undefined && prevStatus !== 4 && curStatus === 4) {
        const title = "Pesanan Ditolak / Dibatalkan";
        const reason = ord.alasan_batal || "Mohon maaf, kantin tidak dapat memproses pesanan ini.";
        const message = `Pesanan #${ord.id} di ${kantinName} ditolak.`;

        playNotificationSound("reject");
        triggerVibration([200, 100, 200]);
        sendBrowserNotification(title, {
          body: `${message} Alasan: ${reason}`,
          tag: `order-${ord.id}-rejected`,
        });

        const notifItem = {
          orderId: ord.id,
          status: 4,
          title,
          message,
          reason,
          opsi_antar: Boolean(ord.opsi_antar),
          kantin_id: ord.kantin_id,
          kantinName,
        };
        setActiveToast(notifItem);
        saveNotification(currentUser?.id || "guest", notifItem);
      }

      // Update recorded status
      prevOrdersStatusRef.current[ord.id] = curStatus;
    });
  }, [customerOrders, kantinList, currentUser?.id]);

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setNotifPermission(res);
  };

  const handleLogout = () => {
    if (confirm("Apakah kamu yakin ingin keluar dari akun?")) {
      try {
        localStorage.removeItem("kon_auth_user");
      } catch (e) {}
      setCurrentUser(null);
      setSelectedKantin(null);
      setCart({});
      router.push("/login");
    }
  };

  // If unauthenticated, show loading before redirect to login
  if (!currentUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-secondary)",
          color: "var(--text-secondary)",
        }}
      >
        <span style={{ fontSize: "0.875rem" }}>Memuat K-ON...</span>
      </div>
    );
  }

  // Active canteen menus
  const canteenMenus = selectedKantin
    ? allMenus.filter((m) => String(m.kantin_id) === String(selectedKantin.id))
    : [];

  // Filtered menus by category
  const filteredMenus = canteenMenus.filter((m) => {
    if (activeCategory === "Semua") return true;
    return m.kategori?.toLowerCase() === activeCategory.toLowerCase();
  });

  // Calculate cart counts and total
  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotalPrice = Object.entries(cart).reduce((sum, [menuId, qty]) => {
    const item = allMenus.find((m) => String(m.id) === String(menuId));
    return sum + (item ? item.harga * qty : 0);
  }, 0);

  // Kantin that owns the current cart
  const cartKantin = kantinList.find((k) => String(k.id) === String(cartKantinId)) || null;
  const cartMenus = cartKantin
    ? allMenus.filter((m) => String(m.kantin_id) === String(cartKantin.id))
    : [];

  // Cart operations
  const handleAddToCart = (menuId) => {
    const menu = allMenus.find((m) => String(m.id) === String(menuId));
    if (!menu) return;
    const kId = String(menu.kantin_id);
    const hasItems = Object.keys(cart).length > 0;
    if (hasItems && cartKantinId && String(cartKantinId) !== kId) {
      if (!confirm("Keranjang berisi menu dari kantin lain. Kosongkan dan pesan dari kantin ini?")) {
        return;
      }
      setCart({ [menuId]: 1 });
      setCartKantinId(kId);
      return;
    }
    setCartKantinId(kId);
    setCart((prev) => ({
      ...prev,
      [menuId]: (prev[menuId] || 0) + 1,
    }));
  };

  const handleRemoveFromCart = (menuId) => {
    setCart((prev) => {
      const current = prev[menuId] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[menuId];
        return copy;
      }
      return { ...prev, [menuId]: current - 1 };
    });
  };

  const handleSelectKantin = (kantin) => {
    setSelectedKantin(kantin);
    setActiveCategory("Semua");
  };

  // Submit order
  const handleSubmitOrder = async (orderPayload) => {
    setIsSubmitting(true);
    try {
      // Prompt browser notification permission if not yet decided
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
        requestNotificationPermission().then((res) => setNotifPermission(res));
      }

      const newOrderId = await createOrder(orderPayload);
      const updatedOrderIds = [newOrderId, ...customerOrderIds];
      setCustomerOrderIds(updatedOrderIds);
      try {
        localStorage.setItem("kon_customer_orders", JSON.stringify(updatedOrderIds));
      } catch (e) {
        console.error("Local storage error:", e);
      }
      // Reset cart
      setCart({});
      setCartKantinId(null);
      setIsCartOpen(false);
      // Switch to order tracking tab
      setActiveTab("pesanan");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Gagal membuat pesanan. Silakan periksa koneksi dan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeOrdersCount = customerOrders.filter((o) => o.status < 3).length;
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "80px" }}>
      {/* Top Application Header */}
      <TopBar
        title={selectedKantin ? selectedKantin.nama : "K-ON"}
        subtitle={
          selectedKantin
            ? "Katalog Menu Kantin"
            : currentUser?.role === "kantin"
            ? "Ibu Kantin"
            : "Kantin Online"
        }
        showBack={Boolean(selectedKantin)}
        onBack={() => setSelectedKantin(null)}
        cartCount={cartItemCount}
        onOpenCart={cartItemCount > 0 ? () => setIsCartOpen(true) : null}
        unreadNotifCount={unreadNotifCount}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSecretTrigger={() => setIsLoginOpen(true)}
      />

      {/* Main Content Area */}
      <main className="app-container">
        {activeTab === "jajan" ? (
          !selectedKantin ? (
            /* Home: Select Kantin */
            <div>
              <div className="page-header">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  {currentUser?.role === "kantin" ? (
                    <Store size={22} color="var(--color-primary)" />
                  ) : (
                    <GraduationCap size={22} color="var(--color-primary)" />
                  )}
                  <h1 className="page-title" style={{ margin: 0 }}>
                    Halo, {currentUser?.nama}!
                  </h1>
                </div>
                <p className="page-subtitle">
                  {currentUser?.role === "kantin"
                    ? "Anda sedang membuka tampilan toko sebagai Ibu Kantin. Anda juga dapat memesan menu di sini."
                    : "Pilih kantin sekolah yang ingin kamu tuju untuk memesan menu favoritmu."}
                </p>
              </div>

              <div className="grid-kantin">
                {kantinList.map((k) => {
                  const count = allMenus.filter(
                    (m) => String(m.kantin_id) === String(k.id) && m.tersedia !== false
                  ).length;
                  return (
                    <KantinCard
                      key={k.id}
                      kantin={k}
                      menuCount={count}
                      onSelect={handleSelectKantin}
                    />
                  );
                })}
              </div>

              {/* Semua menu dari semua kantin */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "28px 0 4px" }}>
                <Utensils size={20} color="var(--color-primary)" />
                <h2 style={{ fontSize: "1.125rem", fontWeight: "700", margin: 0 }}>
                  Menu Tersedia Hari Ini
                </h2>
              </div>
              <p className="page-subtitle" style={{ marginBottom: "8px" }}>
                Semua menu yang ditambahkan oleh kantin sekolah.
              </p>
              <CategoryChips activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
              {(() => {
                const feed = allMenus.filter(
                  (m) =>
                    activeCategory === "Semua" ||
                    m.kategori?.toLowerCase() === activeCategory.toLowerCase()
                );
                if (feed.length === 0) {
                  return (
                    <EmptyState
                      icon={Utensils}
                      title="Belum ada menu"
                      subtitle="Menu akan muncul setelah kantin menambahkannya."
                    />
                  );
                }
                return (
                  <div className="grid-menu">
                    {feed.map((menu) => {
                      const k = kantinList.find((x) => String(x.id) === String(menu.kantin_id));
                      const closed = !k || k.buka === false;
                      return (
                        <div key={menu.id}>
                          <div
                            style={{
                              fontSize: "0.6875rem",
                              fontWeight: 600,
                              color: "var(--text-secondary)",
                              margin: "0 0 4px 2px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Store size={12} />
                            {k?.nama || "Kantin"}
                            {closed ? " • Tutup" : ""}
                          </div>
                          <MenuCard
                            menu={closed ? { ...menu, tersedia: false } : menu}
                            cartQty={cart[menu.id] || 0}
                            onAddToCart={handleAddToCart}
                            onRemoveFromCart={handleRemoveFromCart}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              <div style={{ textAlign: "center", margin: "32px 0 16px" }}>
                {currentUser?.role === "kantin" ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => router.push("/dashboard")}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <ChefHat size={15} /> Kembali ke Dashboard Pengelolaan
                  </button>
                ) : (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsLoginOpen(true)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <ChefHat size={15} /> Masuk ke Dashboard Ibu Kantin
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Canteen Menu Catalog */
            <div style={{ marginTop: "16px" }}>
              {/* Category Filter Chips */}
              <CategoryChips
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />

              {/* Best Seller Featured Banner if on "Semua" tab */}
              {activeCategory === "Semua" && canteenMenus.length > 0 && (
                <div
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-lg)",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: "var(--primary-subtle)",
                        color: "var(--color-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Flame size={24} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          color: "var(--accent-primary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Flame size={12} /> Rekomendasi Menu
                      </div>
                      <div style={{ fontSize: "1rem", fontWeight: "700" }}>
                        {canteenMenus[0]?.nama}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                        {formatRupiah(canteenMenus[0]?.harga)}
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAddToCart(canteenMenus[0].id)}
                  >
                    + Pesan
                  </button>
                </div>
              )}

              {/* Menu Grid */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "16px" }}>
                <Utensils size={18} color="var(--color-primary)" />
                <h2 style={{ fontSize: "1.125rem", fontWeight: "700", margin: 0 }}>
                  {activeCategory === "Semua" ? "Semua Menu" : activeCategory}
                </h2>
              </div>

              {filteredMenus.length > 0 ? (
                <div className="grid-menu" style={{ marginTop: "12px" }}>
                  {filteredMenus.map((menu) => (
                    <MenuCard
                      key={menu.id}
                      menu={menu}
                      cartQty={cart[menu.id] || 0}
                      onAddToCart={handleAddToCart}
                      onRemoveFromCart={handleRemoveFromCart}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Utensils}
                  title="Belum ada menu di kategori ini"
                  subtitle="Silakan pilih kategori menu lainnya."
                />
              )}
            </div>
          )
        ) : (
          /* Order Tracking Tab: "Pesanan Saya" */
          <div style={{ marginTop: "16px" }}>
            <div className="page-header">
              <h1 className="page-title">Pesanan Saya</h1>
              <p className="page-subtitle">
                Status pesanan Anda diperbarui secara otomatis (real-time).
              </p>
            </div>

            {/* Notification Permission Prompt Banner */}
            {notifPermission === "default" && (
              <div
                style={{
                  margin: "12px 0 16px",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "var(--accent-primary-light)",
                  border: "1px solid #BFDBFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "var(--accent-primary)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Bell size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: "700", color: "var(--text-primary)" }}>
                      Nyalakan Notifikasi Pesanan
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Dapatkan pemberitahuan langsung saat makanan siap diambil atau jika pesanan ditolak.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleRequestPermission}
                  style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  Nyalakan
                </button>
              </div>
            )}

            {customerOrders.length > 0 ? (
              <div style={{ marginTop: "12px" }}>
                {customerOrders.map((ord) => {
                  const kantin = kantinList.find(
                    (k) => String(k.id) === String(ord.kantin_id)
                  );
                  return (
                    <OrderCard
                      key={ord.id}
                      order={ord}
                      kantinName={kantin?.nama || "Kantin"}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={PackageOpen}
                title="Belum ada pesanan aktif"
                subtitle="Yuk pilih menu favoritmu di kantin dan buat pesanan pertama!"
                actionText="Jajan Sekarang"
                onAction={() => setActiveTab("jajan")}
              />
            )}
          </div>
        )}
      </main>

      {/* Real-Time Floating Notification Toast */}
      <NotificationToast
        notification={activeToast}
        onClose={() => setActiveToast(null)}
        onAction={() => setActiveTab("pesanan")}
      />

      {/* Notification Center Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => markAllNotificationsRead(currentUser?.id || "guest")}
        onClearAll={() => clearAllNotifications(currentUser?.id || "guest")}
        onSelectNotification={() => setActiveTab("pesanan")}
      />

      {/* Floating Cart Bar (appears when items are in cart) */}
      <FloatingCartBar
        itemCount={cartItemCount}
        totalPrice={cartTotalPrice}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Cart & Checkout Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        kantin={cartKantin}
        cart={cart}
        menuList={cartMenus}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmitting}
        currentUser={currentUser}
      />

      {/* Secret Seller Login Modal (10-tap logo trigger) */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        kantinList={kantinList}
      />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        activeOrderCount={activeOrdersCount}
      />
    </div>
  );
}
