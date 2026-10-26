"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  subscribeKantin,
  updateKantinStatus,
  updateKantinProfile,
  subscribeOrdersByKantin,
  updateOrderStatus,
  subscribeMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  subscribeOfflineSales,
  addOfflineSale,
  deleteOfflineSale,
  subscribeExpenses,
  addExpense,
  deleteExpense,
} from "@/lib/firestore";
import { uploadImage } from "@/lib/storage";
import { formatRupiah, formatTime, formatDate, ORDER_STATUS, getOrderStatusInfo, ONGKIR_FLAT } from "@/lib/utils";
import {
  Store,
  Utensils,
  ClipboardList,
  Calculator,
  Calendar,
  TrendingUp,
  QrCode,
  LogOut,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Flame,
  Truck,
  XCircle,
  X,
  AlertTriangle,
  Coffee,
  Cookie,
  UserCheck,
  Banknote,
  ChefHat,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [sellerId, setSellerId] = useState(null);
  const [kantin, setKantin] = useState(null);
  const [activeTab, setActiveTab] = useState("ord"); // "ord" | "mn" | "hp" | "rk" | "lr" | "pq" | "kp"
  const [period, setPeriod] = useState("h"); // "h" (hari ini), "w" (7 hari), "b" (bulan ini), "a" (semua)
  const [todayStr, setTodayStr] = useState("");
  const [mounted, setMounted] = useState(false);

  // Data states
  const [orders, setOrders] = useState([]);
  const [menus, setMenus] = useState([]);
  const [offlineSales, setOfflineSales] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Check login and initialize dates on mount
  useEffect(() => {
    setMounted(true);
    setTodayStr(new Date().toDateString());
    try {
      const storedId = localStorage.getItem("kon_seller_id");
      if (!storedId) {
        router.push("/");
        return;
      }
      setSellerId(storedId);
    } catch (e) {
      router.push("/");
    }
  }, [router]);

  // Subscribe to Kantin profile
  useEffect(() => {
    if (!sellerId) return;
    const unsub = subscribeKantin((list) => {
      const current = list.find((k) => String(k.id) === String(sellerId));
      if (current) setKantin(current);
    });
    return () => unsub?.();
  }, [sellerId]);

  // Subscribe to Orders for this canteen (Real-Time)
  useEffect(() => {
    if (!sellerId) return;
    const unsub = subscribeOrdersByKantin(sellerId, (list) => {
      setOrders(list);
    });
    return () => unsub?.();
  }, [sellerId]);

  // Subscribe to Menus
  useEffect(() => {
    if (!sellerId) return;
    const unsub = subscribeMenu(sellerId, (list) => {
      setMenus(list);
    });
    return () => unsub?.();
  }, [sellerId]);

  // Subscribe to Offline Sales
  useEffect(() => {
    if (!sellerId) return;
    const unsub = subscribeOfflineSales(sellerId, (list) => {
      setOfflineSales(list);
    });
    return () => unsub?.();
  }, [sellerId]);

  // Subscribe to Expenses
  useEffect(() => {
    if (!sellerId) return;
    const unsub = subscribeExpenses(sellerId, (list) => {
      setExpenses(list);
    });
    return () => unsub?.();
  }, [sellerId]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("kon_seller_id");
    } catch (e) {}
    router.push("/");
  };

  // Toggle canteen open/close status
  const handleToggleKantin = async () => {
    if (!kantin) return;
    const newStatus = kantin.buka === false ? true : false;
    await updateKantinStatus(kantin.id, newStatus);
  };

  /* Helper to check if a date falls in the selected period */
  const isInPeriod = (timeVal) => {
    if (!timeVal) return false;
    const d = new Date(timeVal);
    const now = new Date();
    if (period === "a") return true;
    if (period === "h") return d.toDateString() === now.toDateString();
    if (period === "w") {
      const diff = now.getTime() - d.getTime();
      return diff <= 7 * 86400000;
    }
    if (period === "b") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
  };

  if (!mounted || !kantin) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>Memuat data kantin...</p>
      </div>
    );
  }

  // Stats calculation for Today
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === todayStr);
  const countStatus0 = todayOrders.filter((o) => o.status === 0).length;
  const countStatus1 = todayOrders.filter((o) => o.status === 1).length;
  const countStatus2 = todayOrders.filter((o) => o.status === 2).length;
  const todayIncome =
    todayOrders.filter((o) => o.status === 3).reduce((sum, o) => sum + o.total, 0) +
    offlineSales
      .filter((s) => new Date(s.tanggal || s.created_at).toDateString() === todayStr)
      .reduce((sum, s) => sum + (s.harga || 0) * (s.jumlah || 1), 0);

  return (
    <div>
      {/* Top Header */}
      <header className="topbar">
        <div className="topbar-content">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "var(--primary-subtle)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Store size={22} />
            </div>
            <div>
              <div className="topbar-brand">Dashboard {kantin.nama}</div>
              <div className="page-subtitle" style={{ marginTop: 0 }}>
                Pengelolaan Kantin & Penjualan
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => router.push("/")}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Eye size={14} /> Lihat Toko
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleLogout}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <LogOut size={14} /> Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="app-container" style={{ marginTop: "16px" }}>
        {/* Canteen Status Banner */}
        <div
          style={{
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              Status Operasional Kantin:
            </div>
            <div
              style={{
                fontSize: "1.125rem",
                fontWeight: "700",
                color: kantin.buka !== false ? "var(--color-success)" : "var(--color-danger)",
              }}
            >
              {kantin.buka !== false ? "BUKA (Menerima Pesanan)" : "TUTUP (Toko Ditutup)"}
            </div>
          </div>

          <button
            className={`btn ${kantin.buka !== false ? "btn-danger" : "btn-success"}`}
            onClick={handleToggleKantin}
          >
            {kantin.buka !== false ? "Tutup Kantin" : "Buka Kantin"}
          </button>
        </div>

        {/* Dashboard 4 Stat Cards */}
        <div className="grid-stats">
          <div className="stat-card warning">
            <div className="stat-value">{countStatus0}</div>
            <div className="stat-label">Pesanan Baru</div>
          </div>
          <div className="stat-card primary">
            <div className="stat-value">{countStatus1}</div>
            <div className="stat-label">Sedang Dimasak</div>
          </div>
          <div className="stat-card info">
            <div className="stat-value">{countStatus2}</div>
            <div className="stat-label">Siap / Diantar</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value" style={{ fontSize: "1.125rem" }}>
              {formatRupiah(todayIncome)}
            </div>
            <div className="stat-label">Pendapatan Hari Ini</div>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="chips-container" style={{ margin: "16px 0 20px" }}>
          {[
            { id: "ord", label: "Pesanan Masuk", icon: ClipboardList },
            { id: "mn", label: "Menu & Harga", icon: Utensils },
            { id: "hp", label: "Hitung HPP", icon: Calculator },
            { id: "rk", label: "Rekap Harian", icon: Calendar },
            { id: "lr", label: "Laba Rugi", icon: TrendingUp },
            { id: "pq", label: "QR Pembayaran", icon: QrCode },
            { id: "kp", label: "Profil Kantin", icon: Store },
          ].map(({ id, label, icon: TabIcon }) => (
            <button
              key={id}
              className={`chip ${activeTab === id ? "active" : ""}`}
              onClick={() => setActiveTab(id)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <TabIcon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Orders Tab */}
        {activeTab === "ord" && (
          <OrdersTab orders={orders} onUpdateStatus={updateOrderStatus} />
        )}

        {/* Tab 2: Menu & Price Management */}
        {activeTab === "mn" && (
          <MenuTab
            kantinId={kantin.id}
            menus={menus}
            onAdd={addMenuItem}
            onUpdate={updateMenuItem}
            onDelete={deleteMenuItem}
          />
        )}

        {/* Tab 3: HPP Calculator */}
        {activeTab === "hp" && (
          <HppTab
            menus={menus}
            onSaveModal={async (menuId, hppValue) => {
              await updateMenuItem(menuId, { modal: hppValue });
              alert(`Harga modal berhasil diperbarui menjadi ${formatRupiah(hppValue)}!`);
            }}
          />
        )}

        {/* Tab 4: Rekap Harian */}
        {activeTab === "rk" && (
          <RekapTab
            kantinId={kantin.id}
            orders={orders}
            offlineSales={offlineSales}
            menus={menus}
            period={period}
            setPeriod={setPeriod}
            isInPeriod={isInPeriod}
            onAddOffline={addOfflineSale}
            onDeleteOffline={deleteOfflineSale}
          />
        )}

        {/* Tab 5: Laba Rugi */}
        {activeTab === "lr" && (
          <LabaRugiTab
            kantinId={kantin.id}
            orders={orders}
            offlineSales={offlineSales}
            expenses={expenses}
            period={period}
            setPeriod={setPeriod}
            isInPeriod={isInPeriod}
            onAddExpense={addExpense}
            onDeleteExpense={deleteExpense}
          />
        )}

        {/* Tab 6: QR Pembayaran */}
        {activeTab === "pq" && (
          <QrTab kantin={kantin} onUpdateProfile={updateKantinProfile} />
        )}

        {/* Tab 7: Profil Kantin */}
        {activeTab === "kp" && (
          <ProfilTab kantin={kantin} onUpdateProfile={updateKantinProfile} />
        )}
      </main>
    </div>
  );
}

/* ==========================================================================
   Tab 1: Orders Component
   ========================================================================== */
function OrdersTab({ orders, onUpdateStatus }) {
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("Stok menu habis");
  const [customReason, setCustomReason] = useState("");

  const QUICK_REASONS = [
    "Stok menu habis",
    "Kantin sudah mau tutup",
    "Antrean terlalu padat",
    "Bahan makanan belum siap",
    "Lainnya",
  ];

  const handleConfirmReject = () => {
    if (!rejectModalOrder) return;
    const finalReason =
      rejectReason === "Lainnya"
        ? customReason.trim() || "Ditolak oleh pihak kantin"
        : rejectReason;
    onUpdateStatus(rejectModalOrder.id, 4, { alasan_batal: finalReason });
    setRejectModalOrder(null);
    setCustomReason("");
  };

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", backgroundColor: "var(--bg-primary)", borderRadius: "var(--radius-lg)" }}>
        <p style={{ color: "var(--text-secondary)" }}>Belum ada pesanan masuk.</p>
      </div>
    );
  }

  return (
    <div>
      {orders.map((ord) => {
        const isCancelled = ord.status === 4;
        const isFinished = ord.status === 3;
        const statusInfo = getOrderStatusInfo(ord.status, ord.opsi_antar);

        // Display nama kelas tanpa dobel
        const displayKelas = ord.kelas
          ? ord.jurusan && ord.jurusan !== ord.kelas
            ? `${ord.kelas} • ${ord.jurusan}`
            : ord.kelas
          : "";

        return (
          <div
            key={ord.id}
            className={`order-card status-${ord.status}`}
            style={{ marginBottom: "16px" }}
          >
            <div className="order-header">
              <span className="order-id">
                #{ord.id} • {ord.nama_pemesan} {displayKelas ? `(${displayKelas})` : ""}
              </span>
              <span className="order-time">{formatTime(ord.created_at)}</span>
            </div>

            <div className="order-meta">
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  {ord.opsi_antar ? (
                    <b style={{ color: "var(--accent-primary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Truck size={14} /> Diantar ke kelas {ord.kelas}
                    </b>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <UserCheck size={14} /> Diambil sendiri
                    </span>
                  )}
                </span>
                <span>•</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  {ord.metode_bayar === "qr" ? (
                    <>
                      <QrCode size={14} /> QRIS
                    </>
                  ) : (
                    <>
                      <Banknote size={14} /> Tunai
                    </>
                  )}
                </span>
              </div>
              {ord.catatan && (
                <div style={{ marginTop: "4px", color: "var(--text-secondary)" }}>
                  Catatan: &ldquo;{ord.catatan}&rdquo;
                </div>
              )}
            </div>

            <div className="order-items-list" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
              <Utensils size={13} style={{ marginRight: "2px" }} />
              {ord.items?.map((it, idx) => (
                <span key={idx}>
                  {it.nama} ×{it.jumlah}
                  {idx < ord.items.length - 1 ? ", " : ""}
                </span>
              ))}
              {ord.ongkir > 0 && (
                <span style={{ color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                  {" "}• Ongkir {formatRupiah(ord.ongkir)}
                </span>
              )}
            </div>

            {/* If cancelled and has reason, display it */}
            {isCancelled && ord.alasan_batal && (
              <div
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-danger)",
                  backgroundColor: "var(--color-danger-light)",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  margin: "8px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <AlertTriangle size={15} />
                <span>
                  <strong>Alasan Penolakan:</strong> {ord.alasan_batal}
                </span>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span style={{ fontWeight: "700", fontSize: "1.0625rem" }}>
                  {formatRupiah(ord.total)}
                </span>{" "}
                —{" "}
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color:
                      ord.status === 4
                        ? "var(--color-danger)"
                        : ord.status === 3
                        ? "var(--color-success)"
                        : "var(--text-primary)",
                  }}
                >
                  {statusInfo.label}
                </span>
              </div>

              {!isFinished && !isCancelled && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onUpdateStatus(ord.id, ord.status + 1)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    {ord.status === 0 ? (
                      <>
                        <ChefHat size={14} /> Terima & Masak
                      </>
                    ) : ord.status === 1 ? (
                      ord.opsi_antar ? (
                        <>
                          <Truck size={14} /> Antar ke Kelas
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} /> Siap Diambil
                        </>
                      )
                    ) : (
                      <>
                        <CheckCircle2 size={14} /> Selesai
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      setRejectModalOrder(ord);
                      setRejectReason("Stok menu habis");
                      setCustomReason("");
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <XCircle size={14} /> Tolak / Batal
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Modal Penolakan / Pembatalan Pesanan */}
      {rejectModalOrder && (
        <div className="modal-overlay" onClick={() => setRejectModalOrder(null)} style={{ zIndex: 1100 }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--color-danger-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-danger)",
                  }}
                >
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0, fontSize: "1.0625rem" }}>
                    Tolak Pesanan #{rejectModalOrder.id}
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    {rejectModalOrder.nama_pemesan} ({rejectModalOrder.kelas})
                  </span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setRejectModalOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "16px" }}>
              <p style={{ margin: "0 0 12px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                Pilih atau masukkan alasan penolakan. Pemberitahuan akan dikirimkan langsung ke siswa pemesan.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                {QUICK_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRejectReason(r)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      border:
                        rejectReason === r
                          ? "1.5px solid var(--color-danger)"
                          : "1px solid var(--border-default)",
                      backgroundColor:
                        rejectReason === r ? "var(--color-danger-light)" : "var(--bg-primary)",
                      color:
                        rejectReason === r ? "var(--color-danger)" : "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {rejectReason === "Lainnya" && (
                <div style={{ marginBottom: "14px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      marginBottom: "4px",
                      color: "var(--text-primary)",
                    }}
                  >
                    Ketik Alasan Penolakan:
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Contoh: Sedang istirahat sholat / antrean penuh"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    autoFocus
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setRejectModalOrder(null)}
                >
                  Kembali
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleConfirmReject}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <XCircle size={15} /> Konfirmasi Tolak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   Tab 2: Menu & Price Management Component
   ========================================================================== */
function MenuTab({ kantinId, menus, onAdd, onUpdate, onDelete }) {
  const [newName, setNewName] = useState("");
  const [newHarga, setNewHarga] = useState("");
  const [newModal, setNewModal] = useState("");
  const [newKategori, setNewKategori] = useState("Makanan");
  const [isUploading, setIsUploading] = useState(false);

  const handleAddMenu = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newHarga) {
      alert("Nama dan harga jual wajib diisi!");
      return;
    }
    await onAdd({
      kantin_id: kantinId,
      nama: newName.trim(),
      harga: Number(newHarga),
      modal: Number(newModal) || 0,
      kategori: newKategori,
      tersedia: true,
      foto_url: null,
    });
    setNewName("");
    setNewHarga("");
    setNewModal("");
    alert("Menu baru berhasil ditambahkan!");
  };

  const handlePhotoUpload = async (menuId, file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file, `menu/${kantinId}/${menuId}_${Date.now()}.jpg`);
      await onUpdate(menuId, { foto_url: url });
      alert("Foto menu berhasil diperbarui!");
    } catch (e) {
      alert("Gagal mengunggah foto.");
    } finally {
      setIsUploading(false);
    }
  };

  const renderIcon = (kategori) => {
    const k = (kategori || "").toLowerCase();
    if (k.includes("minum")) return <Coffee size={24} color="var(--color-primary)" />;
    if (k.includes("snack")) return <Cookie size={24} color="var(--color-primary)" />;
    return <Utensils size={24} color="var(--color-primary)" />;
  };

  return (
    <div>
      {/* Add Menu Form */}
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          padding: "16px",
          marginBottom: "20px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
          <Plus size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: "1rem", fontWeight: "700", margin: 0 }}>
            Tambah Menu Baru
          </h3>
        </div>
        <form onSubmit={handleAddMenu}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label className="form-label">Nama Menu *</label>
              <input
                className="form-input"
                placeholder="Contoh: Nasi Bakar Ayam"
                maxLength={30}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Harga Jual (Rp) *</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="500"
                placeholder="8000"
                value={newHarga}
                onChange={(e) => setNewHarga(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Harga Modal (Rp)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="500"
                placeholder="5000"
                value={newModal}
                onChange={(e) => setNewModal(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Kategori</label>
              <select
                className="form-select"
                value={newKategori}
                onChange={(e) => setNewKategori(e.target.value)}
              >
                <option>Makanan</option>
                <option>Minuman</option>
                <option>Snack</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-sm"
            style={{ marginTop: "12px" }}
          >
            Simpan Menu
          </button>
        </form>
      </div>

      {/* Menu List */}
      <div>
        <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "12px" }}>
          Daftar Menu ({menus.length} item)
        </h3>
        {menus.map((m) => (
          <div
            key={m.id}
            style={{
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "180px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background: "var(--bg-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {m.foto_url ? (
                  <img
                    src={m.foto_url}
                    alt={m.nama}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                  />
                ) : (
                  renderIcon(m.kategori)
                )}
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "0.9375rem" }}>{m.nama}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Jual: {formatRupiah(m.harga)} • Modal: {formatRupiah(m.modal || 0)} ({m.kategori})
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {/* Photo Upload */}
              <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                Foto
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handlePhotoUpload(m.id, e.target.files[0])}
                  disabled={isUploading}
                />
              </label>

              {/* Availability Toggle */}
              <button
                className={`btn btn-sm ${m.tersedia !== false ? "btn-secondary" : "btn-danger"}`}
                onClick={() => onUpdate(m.id, { tersedia: m.tersedia === false ? true : false })}
              >
                {m.tersedia !== false ? "Tersedia" : "Habis"}
              </button>

              {/* Delete Menu */}
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (confirm(`Hapus menu "${m.nama}"?`)) onDelete(m.id);
                }}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   Tab 3: HPP Calculator Component
   ========================================================================== */
function HppTab({ menus, onSaveModal }) {
  const [selectedMenuId, setSelectedMenuId] = useState(menus[0]?.id || "");
  const [isTitipan, setIsTitipan] = useState(false);

  // Titipan fields
  const [hargaTitipan, setHargaTitipan] = useState("");

  // Production fields
  const [materials, setMaterials] = useState([
    { nama: "Bahan 1", jumlah: 1, satuan: "kg", harga: 20000 },
  ]);
  const [gajiHarian, setGajiHarian] = useState(50000);
  const [produkHarian, setProdukHarian] = useState(50);
  const [overheadBulanan, setOverheadBulanan] = useState(200000);
  const [produksiBulanan, setProduksiBulanan] = useState(1000);
  const [batchOutput, setBatchOutput] = useState(10); // output from materials

  const selectedMenu = menus.find((m) => String(m.id) === String(selectedMenuId));

  // Material operations
  const addMaterial = () => {
    setMaterials([...materials, { nama: "", jumlah: 1, satuan: "", harga: 0 }]);
  };
  const removeMaterial = (idx) => {
    setMaterials(materials.filter((_, i) => i !== idx));
  };
  const updateMaterial = (idx, field, val) => {
    const copy = [...materials];
    copy[idx][field] = val;
    setMaterials(copy);
  };

  // Calculations
  const totalBahan = materials.reduce(
    (sum, m) => sum + (Number(m.jumlah) || 0) * (Number(m.harga) || 0),
    0
  );
  const bahanPerProduk = batchOutput > 0 ? totalBahan / Number(batchOutput) : 0;
  const tenagaPerProduk = produkHarian > 0 ? Number(gajiHarian) / Number(produkHarian) : 0;
  const overheadPerProduk =
    produksiBulanan > 0 ? Number(overheadBulanan) / Number(produksiBulanan) : 0;

  const hppPerProduk = isTitipan
    ? Number(hargaTitipan) || 0
    : Math.round(bahanPerProduk + tenagaPerProduk + overheadPerProduk);

  const labaPerProduk = (selectedMenu?.harga || 0) - hppPerProduk;

  return (
    <div>
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "12px" }}>
          🧮 Hitung Harga Pokok Produksi (HPP)
        </h3>

        <div className="form-group">
          <label className="form-label">1. Pilih Menu</label>
          <select
            className="form-select"
            value={selectedMenuId}
            onChange={(e) => setSelectedMenuId(e.target.value)}
          >
            {menus.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama} — Harga Jual: {formatRupiah(m.harga)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={isTitipan}
              onChange={(e) => setIsTitipan(e.target.checked)}
            />
            📦 Ini barang titipan / konsinyasi (dari pihak lain)
          </label>
        </div>

        {isTitipan ? (
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              padding: "12px",
              borderRadius: "var(--radius-md)",
              marginBottom: "16px",
            }}
          >
            <label className="form-label">Harga awal dari penitip (Rp)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              placeholder="Contoh: 6000"
              value={hargaTitipan}
              onChange={(e) => setHargaTitipan(e.target.value)}
            />
          </div>
        ) : (
          <>
            {/* Bahan baku */}
            <div style={{ marginBottom: "16px" }}>
              <label className="form-label">2. Bahan yang Dibeli untuk 1 Kali Produksi</label>
              {materials.map((mat, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 2fr auto",
                    gap: "6px",
                    marginBottom: "6px",
                    alignItems: "center",
                  }}
                >
                  <input
                    className="form-input"
                    placeholder="Nama bahan"
                    value={mat.nama}
                    onChange={(e) => updateMaterial(i, "nama", e.target.value)}
                  />
                  <input
                    className="form-input"
                    type="number"
                    step="any"
                    placeholder="Jml"
                    value={mat.jumlah}
                    onChange={(e) => updateMaterial(i, "jumlah", e.target.value)}
                  />
                  <input
                    className="form-input"
                    placeholder="Satuan"
                    value={mat.satuan}
                    onChange={(e) => updateMaterial(i, "satuan", e.target.value)}
                  />
                  <input
                    className="form-input"
                    type="number"
                    placeholder="Harga beli"
                    value={mat.harga}
                    onChange={(e) => updateMaterial(i, "harga", e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeMaterial(i)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={addMaterial}
                style={{ marginTop: "6px" }}
              >
                + Tambah Bahan
              </button>
            </div>

            {/* Operasional */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div style={{ backgroundColor: "var(--bg-secondary)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontWeight: "700", fontSize: "0.8125rem", marginBottom: "6px" }}>
                  👩‍🍳 Biaya Tenaga Kerja
                </div>
                <label className="form-label">Gaji harian (Rp)</label>
                <input
                  className="form-input"
                  type="number"
                  value={gajiHarian}
                  onChange={(e) => setGajiHarian(e.target.value)}
                />
                <label className="form-label" style={{ marginTop: "6px" }}>
                  Produksi per hari (item)
                </label>
                <input
                  className="form-input"
                  type="number"
                  value={produkHarian}
                  onChange={(e) => setProdukHarian(e.target.value)}
                />
              </div>

              <div style={{ backgroundColor: "var(--bg-secondary)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontWeight: "700", fontSize: "0.8125rem", marginBottom: "6px" }}>
                  💡 Biaya Overhead (Listrik, sewa, gas)
                </div>
                <label className="form-label">Biaya bulanan (Rp)</label>
                <input
                  className="form-input"
                  type="number"
                  value={overheadBulanan}
                  onChange={(e) => setOverheadBulanan(e.target.value)}
                />
                <label className="form-label" style={{ marginTop: "6px" }}>
                  Produksi per bulan (item)
                </label>
                <input
                  className="form-input"
                  type="number"
                  value={produksiBulanan}
                  onChange={(e) => setProduksiBulanan(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                3. Jumlah Produk Jadi dari Bahan di Atas (item)
              </label>
              <input
                className="form-input"
                type="number"
                min="1"
                value={batchOutput}
                onChange={(e) => setBatchOutput(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Result Card */}
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            marginTop: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span>HPP per Produk</span>
            <b style={{ fontSize: "1.125rem" }}>{formatRupiah(hppPerProduk)}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span>Harga Jual Menu Saat Ini</span>
            <b>{formatRupiah(selectedMenu?.harga || 0)}</b>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "8px",
              borderTop: "1px dashed var(--border-default)",
              color: labaPerProduk >= 0 ? "var(--color-success)" : "var(--color-danger)",
              fontWeight: "700",
            }}
          >
            <span>Estimasi Laba per Porsi</span>
            <span>{formatRupiah(labaPerProduk)}</span>
          </div>

          <button
            className="btn btn-success btn-block"
            style={{ marginTop: "14px" }}
            onClick={() => onSaveModal(selectedMenuId, hppPerProduk)}
          >
            ✅ Terapkan sebagai Harga Modal Menu Ini
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Tab 4: Rekap Harian Component
   ========================================================================== */
function RekapTab({
  kantinId,
  orders,
  offlineSales,
  menus,
  period,
  setPeriod,
  isInPeriod,
  onAddOffline,
  onDeleteOffline,
}) {
  const [offlineDate, setOfflineDate] = useState("");
  const [offlineMenuId, setOfflineMenuId] = useState(menus[0]?.id || "");
  const [offlineQty, setOfflineQty] = useState(1);

  useEffect(() => {
    setOfflineDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Filtered orders (status 3 = selesai) & offline sales
  const completedOrders = orders.filter((o) => o.status === 3 && isInPeriod(o.created_at));
  const filteredOffline = offlineSales.filter((s) => isInPeriod(s.tanggal || s.created_at));

  // Group by date
  const dateMap = {};
  completedOrders.forEach((o) => {
    const dStr = formatDate(o.created_at);
    if (!dateMap[dStr]) dateMap[dStr] = { online: 0, ongkir: 0, offline: 0, count: 0 };
    dateMap[dStr].online += o.total - (o.ongkir || 0);
    dateMap[dStr].ongkir += o.ongkir || 0;
    dateMap[dStr].count += 1;
  });

  filteredOffline.forEach((s) => {
    const dStr = formatDate(s.tanggal || s.created_at);
    if (!dateMap[dStr]) dateMap[dStr] = { online: 0, ongkir: 0, offline: 0, count: 0 };
    dateMap[dStr].offline += (s.harga || 0) * (s.jumlah || 1);
  });

  const handleAddOffline = async (e) => {
    e.preventDefault();
    const selMenu = menus.find((m) => String(m.id) === String(offlineMenuId));
    if (!selMenu) return;

    await onAddOffline({
      kantin_id: kantinId,
      tanggal: new Date(offlineDate).toISOString(),
      nama_menu: selMenu.nama,
      harga: selMenu.harga,
      modal: selMenu.modal || 0,
      jumlah: Number(offlineQty) || 1,
    });
    alert("Penjualan offline berhasil dicatat!");
  };

  return (
    <div>
      {/* Period Filter */}
      <div className="chips-container" style={{ marginBottom: "12px" }}>
        {[
          ["h", "Hari ini"],
          ["w", "7 hari"],
          ["b", "Bulan ini"],
          ["a", "Semua"],
        ].map(([k, label]) => (
          <button
            key={k}
            className={`chip ${period === k ? "active" : ""}`}
            onClick={() => setPeriod(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Form Catat Offline */}
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "10px" }}>
          Catat Penjualan Langsung di Kantin (Offline)
        </h3>
        <form onSubmit={handleAddOffline}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
            <div>
              <label className="form-label">Tanggal</label>
              <input
                className="form-input"
                type="date"
                value={offlineDate}
                onChange={(e) => setOfflineDate(e.target.value)}
                required
              />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label className="form-label">Pilih Menu</label>
              <select
                className="form-select"
                value={offlineMenuId}
                onChange={(e) => setOfflineMenuId(e.target.value)}
              >
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama} — {formatRupiah(m.harga)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Jumlah</label>
              <input
                className="form-input"
                type="number"
                min="1"
                value={offlineQty}
                onChange={(e) => setOfflineQty(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: "10px" }}>
            Catat Penjualan
          </button>
        </form>
      </div>

      {/* Recap Table */}
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          padding: "16px",
          overflowX: "auto",
        }}
      >
        <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "12px" }}>
          📅 Rekapitulasi Penjualan
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-default)", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Tanggal</th>
              <th style={{ padding: "8px" }}>Online</th>
              <th style={{ padding: "8px" }}>Ongkir</th>
              <th style={{ padding: "8px" }}>Offline</th>
              <th style={{ padding: "8px" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(dateMap).length > 0 ? (
              Object.entries(dateMap).map(([dStr, val]) => (
                <tr key={dStr} style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <td style={{ padding: "8px", fontWeight: "600" }}>{dStr}</td>
                  <td style={{ padding: "8px" }}>
                    {formatRupiah(val.online)} ({val.count} pesanan)
                  </td>
                  <td style={{ padding: "8px" }}>{formatRupiah(val.ongkir)}</td>
                  <td style={{ padding: "8px" }}>{formatRupiah(val.offline)}</td>
                  <td style={{ padding: "8px", fontWeight: "700" }}>
                    {formatRupiah(val.online + val.ongkir + val.offline)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: "16px", textAlign: "center", color: "var(--text-secondary)" }}>
                  Belum ada transaksi di periode ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==========================================================================
   Tab 5: Laba Rugi Component
   ========================================================================== */
function LabaRugiTab({
  kantinId,
  orders,
  offlineSales,
  expenses,
  period,
  setPeriod,
  isInPeriod,
  onAddExpense,
  onDeleteExpense,
}) {
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState("");

  const completedOrders = orders.filter((o) => o.status === 3 && isInPeriod(o.created_at));
  const filteredOffline = offlineSales.filter((s) => isInPeriod(s.tanggal || s.created_at));
  const filteredExpenses = expenses.filter((e) => isInPeriod(e.created_at));

  // Income
  const revOnline = completedOrders.reduce((s, o) => s + (o.total - (o.ongkir || 0)), 0);
  const revOngkir = completedOrders.reduce((s, o) => s + (o.ongkir || 0), 0);
  const revOffline = filteredOffline.reduce((s, o) => s + (o.harga || 0) * (o.jumlah || 1), 0);
  const totalRevenue = revOnline + revOngkir + revOffline;

  // HPP
  const hppOnline = completedOrders.reduce(
    (s, o) => s + (o.items?.reduce((a, it) => a + (it.modal || 0) * it.jumlah, 0) || 0),
    0
  );
  const hppOffline = filteredOffline.reduce(
    (s, o) => s + (o.modal || 0) * (o.jumlah || 1),
    0
  );
  const totalHpp = hppOnline + hppOffline;

  // Gross profit & Net profit
  const grossProfit = totalRevenue - totalHpp;
  const totalOtherExpenses = filteredExpenses.reduce((s, e) => s + (Number(e.jumlah) || 0), 0);
  const netProfit = grossProfit - totalOtherExpenses;

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expDesc.trim() || !expAmount) return;
    await onAddExpense({
      kantin_id: kantinId,
      keterangan: expDesc.trim(),
      jumlah: Number(expAmount),
    });
    setExpDesc("");
    setExpAmount("");
    alert("Biaya operasional berhasil dicatat!");
  };

  return (
    <div>
      <div className="chips-container" style={{ marginBottom: "12px" }}>
        {[
          ["h", "Hari ini"],
          ["w", "7 hari"],
          ["b", "Bulan ini"],
          ["a", "Semua"],
        ].map(([k, label]) => (
          <button
            key={k}
            className={`chip ${period === k ? "active" : ""}`}
            onClick={() => setPeriod(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Laporan Laba Rugi Statement */}
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ fontSize: "1.0625rem", fontWeight: "700", marginBottom: "12px" }}>
          📊 Laporan Laba Rugi
        </h3>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed var(--border-default)" }}>
          <span>Penjualan Online ({completedOrders.length} pesanan)</span>
          <b>{formatRupiah(revOnline)}</b>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed var(--border-default)" }}>
          <span>Ongkos Pengantaran (Ongkir)</span>
          <b>{formatRupiah(revOngkir)}</b>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed var(--border-default)" }}>
          <span>Penjualan Langsung / Offline</span>
          <b>{formatRupiah(revOffline)}</b>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontWeight: "700", borderBottom: "1px solid var(--border-default)" }}>
          <span>Total Pendapatan</span>
          <span>{formatRupiah(totalRevenue)}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed var(--border-default)", color: "var(--text-secondary)" }}>
          <span>Harga Pokok Penjualan (HPP)</span>
          <span>− {formatRupiah(totalHpp)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-default)", fontWeight: "600" }}>
          <span>Laba Kotor</span>
          <span>{formatRupiah(grossProfit)}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed var(--border-default)", color: "var(--text-secondary)" }}>
          <span>Biaya Operasional Lain</span>
          <span>− {formatRupiah(totalOtherExpenses)}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 0 4px",
            fontSize: "1.125rem",
            fontWeight: "800",
            color: netProfit >= 0 ? "var(--color-success)" : "var(--color-danger)",
          }}
        >
          <span>{netProfit >= 0 ? "🎉 LABA BERSIH" : "😢 RUGI BERSIH"}</span>
          <span>{formatRupiah(netProfit)}</span>
        </div>
      </div>

      {/* Catat Pengeluaran Lain */}
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          padding: "16px",
        }}
      >
        <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "10px" }}>
          🧾 Biaya Operasional / Pengeluaran Lain
        </h3>
        <form onSubmit={handleAddExpense} style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
          <input
            className="form-input"
            style={{ flex: 2, minWidth: "150px" }}
            placeholder="Keterangan (misal: gas LPG, plastik bungkus)"
            value={expDesc}
            onChange={(e) => setExpDesc(e.target.value)}
            required
          />
          <input
            className="form-input"
            style={{ flex: 1, minWidth: "120px" }}
            type="number"
            min="0"
            step="1000"
            placeholder="Jumlah (Rp)"
            value={expAmount}
            onChange={(e) => setExpAmount(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Catat
          </button>
        </form>

        {filteredExpenses.map((exp) => (
          <div
            key={exp.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 0",
              borderBottom: "1px solid var(--border-default)",
              fontSize: "0.875rem",
            }}
          >
            <span>{exp.keterangan}</span>
            <span>
              {formatRupiah(exp.jumlah)}{" "}
              <button
                className="btn btn-danger btn-sm"
                style={{ padding: "2px 8px" }}
                onClick={() => onDeleteExpense(exp.id)}
              >
                ✕
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   Tab 6: QR Pembayaran Component
   ========================================================================== */
function QrTab({ kantin, onUpdateProfile }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadQr = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file, `qr/${kantin.id}_${Date.now()}.png`);
      await onUpdateProfile(kantin.id, { qr_url: url });
      alert("QRIS Pembayaran berhasil diperbarui!");
    } catch (e) {
      alert("Gagal mengunggah QRIS.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetQr = async () => {
    if (confirm("Kembalikan ke QR contoh bawaan?")) {
      await onUpdateProfile(kantin.id, { qr_url: null });
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-primary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        textAlign: "center",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <h3 style={{ fontSize: "1.0625rem", fontWeight: "700", marginBottom: "8px" }}>
        📱 QR Code Pembayaran Kantin
      </h3>
      <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
        QRIS ini akan ditampilkan kepada pembeli saat memilih metode bayar QR Code.
      </p>

      <div
        style={{
          width: "200px",
          height: "200px",
          margin: "0 auto 16px",
          border: "2px dashed var(--border-default)",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {kantin.qr_url ? (
          <img src={kantin.qr_url} alt="QRIS" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        ) : (
          <div style={{ textAlign: "center", padding: "12px" }}>
            <span style={{ fontSize: "3rem" }}>📱</span>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              Belum ada QR asli
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <label className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}>
          📤 Ganti QRIS Asli
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleUploadQr(e.target.files[0])}
            disabled={isUploading}
          />
        </label>
        {kantin.qr_url && (
          <button className="btn btn-secondary btn-sm" onClick={handleResetQr}>
            Hapus QR
          </button>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   Tab 7: Profil Kantin Component
   ========================================================================== */
function ProfilTab({ kantin, onUpdateProfile }) {
  const [name, setName] = useState(kantin.nama || "");
  const [isUploading, setIsUploading] = useState(false);

  const handleSaveName = async () => {
    if (!name.trim()) return;
    await onUpdateProfile(kantin.id, { nama: name.trim() });
    alert("Nama kantin berhasil disimpan!");
  };

  const handleUploadPhoto = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file, `kantin/${kantin.id}_${Date.now()}.jpg`);
      await onUpdateProfile(kantin.id, { foto_url: url });
      alert("Foto profil kantin berhasil diperbarui!");
    } catch (e) {
      alert("Gagal mengunggah foto.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-primary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        maxWidth: "460px",
        margin: "0 auto",
      }}
    >
      <h3 style={{ fontSize: "1.0625rem", fontWeight: "700", marginBottom: "16px" }}>
        🏪 Profil & Pengaturan Kantin
      </h3>

      <div
        style={{
          width: "100%",
          height: "160px",
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
        {kantin.foto_url ? (
          <img src={kantin.foto_url} alt={kantin.nama} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Store size={56} strokeWidth={1.5} color="var(--color-primary)" />
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Nama Kantin</label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" onClick={handleSaveName}>
            Simpan
          </button>
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <label className="btn btn-secondary btn-block" style={{ cursor: "pointer" }}>
          📷 Ganti Foto Kantin
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleUploadPhoto(e.target.files[0])}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
}
