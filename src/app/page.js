"use client";

import { useState, useEffect } from "react";
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
import {
  subscribeKantin,
  subscribeMenu,
  subscribeCustomerOrders,
  createOrder,
} from "@/lib/firestore";
import { formatRupiah } from "@/lib/utils";
import {
  Flame,
  Utensils,
  Store,
  ChefHat,
  PackageOpen,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("jajan"); // "jajan" | "pesanan"
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [kantinList, setKantinList] = useState([]);
  const [selectedKantin, setSelectedKantin] = useState(null);
  const [allMenus, setAllMenus] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartKantinId, setCartKantinId] = useState(null);

  // Customer orders stored by ID in browser
  const [customerOrderIds, setCustomerOrderIds] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);

  // Check auth user on mount - jika belum login, arahkan ke /login
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("kon_auth_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        setIsAuthChecking(false);
      } else {
        router.replace("/login");
      }
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  // Load customer order IDs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kon_customer_orders");
      if (saved) {
        setCustomerOrderIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load customer order IDs", e);
    }
  }, []);

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

  // Subscribe to customer orders
  useEffect(() => {
    if (customerOrderIds.length === 0) {
      setCustomerOrders([]);
      return;
    }
    const unsub = subscribeCustomerOrders(customerOrderIds, (orders) => {
      setCustomerOrders(orders);
    });
    return () => unsub?.();
  }, [customerOrderIds]);

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

  // If checking authentication or unauthenticated, show loading before redirect
  if (isAuthChecking || !currentUser) {
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

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "80px" }}>
      {/* Top Application Header */}
      <TopBar
        title={selectedKantin ? selectedKantin.nama : "K-ON"}
        subtitle={
          selectedKantin
            ? "Katalog Menu Kantin"
            : currentUser?.role === "kantin"
            ? "Kantin Online • Ibu Kantin"
            : `Kantin Online • ${currentUser?.kelas || "Siswa"}`
        }
        showBack={Boolean(selectedKantin)}
        onBack={() => setSelectedKantin(null)}
        cartCount={cartItemCount}
        onOpenCart={cartItemCount > 0 ? () => setIsCartOpen(true) : null}
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
