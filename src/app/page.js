"use client";

import { useState, useEffect } from "react";
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

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("jajan"); // "jajan" | "pesanan"
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

  // Kantin that owns the current cart (cart can only hold one kantin at a time)
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

      setCart({});
      setIsCartOpen(false);
      setActiveTab("pesanan");
    } catch (err) {
      console.error("Failed to submit order:", err);
      alert("Gagal mengirim pesanan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Active non-finished order count for bottom nav badge
  const activeOrdersCount = customerOrders.filter((o) => o.status < 3).length;

  return (
    <div>
      {/* Top Bar */}
      <TopBar
        title={
          activeTab === "pesanan"
            ? "Pesanan Saya 📦"
            : selectedKantin
            ? `${selectedKantin.emoji || "🏪"} ${selectedKantin.nama}`
            : "K-ON 🎈"
        }
        subtitle={
          activeTab === "pesanan"
            ? "Pantau status pesananmu"
            : selectedKantin
            ? "Pilih jajanan favoritmu!"
            : "Kantin Online Sekolah"
        }
        showBack={Boolean(selectedKantin && activeTab === "jajan")}
        onBack={() => {
          setSelectedKantin(null);
        }}
        cartCount={cartItemCount}
        onOpenCart={cartItemCount > 0 ? () => setIsCartOpen(true) : null}
        onSecretTrigger={() => setIsLoginOpen(true)}
      />

      {/* Main Content Area */}
      <main className="app-container">
        {activeTab === "jajan" ? (
          !selectedKantin ? (
            /* Home: Select Kantin */
            <div>
              <div className="page-header">
                <h1 className="page-title">Halo, teman! 👋</h1>
                <p className="page-subtitle">Mau jajan di kantin mana hari ini?</p>
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
              <h2 style={{ fontSize: "1.125rem", fontWeight: "700", margin: "24px 0 4px" }}>
                🍽️ Menu Hari Ini
              </h2>
              <p className="page-subtitle" style={{ marginBottom: "8px" }}>
                Semua menu yang ditambahkan ibu kantin tampil di sini.
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
                      icon="🍽️"
                      title="Belum ada menu"
                      subtitle="Menu akan muncul setelah ibu kantin menambahkannya."
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
                            }}
                          >
                            {k?.emoji || "🏪"} {k?.nama || "Kantin"}
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
                <button className="btn btn-secondary btn-sm" onClick={() => setIsLoginOpen(true)}>
                  👩‍🍳 Masuk / Daftar Ibu Kantin
                </button>
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
                    <span style={{ fontSize: "2.4rem" }}>
                      {canteenMenus[0]?.emoji || "⭐"}
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          color: "var(--accent-primary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        ⭐ Rekomendasi Menu
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
              <h2 style={{ fontSize: "1.125rem", fontWeight: "700", marginTop: "16px" }}>
                {activeCategory === "Semua" ? "📋 Semua Menu" : activeCategory}
              </h2>

              {filteredMenus.length > 0 ? (
                <div className="grid-menu">
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
                  icon="🍽️"
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
              <h1 className="page-title">📦 Pesanan Saya</h1>
              <p className="page-subtitle">
                Status pesanan diperbarui secara otomatis (real-time).
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
                icon="🍭"
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
