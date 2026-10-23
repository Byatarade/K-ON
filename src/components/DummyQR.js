"use client";

/**
 * Dummy QRIS visual component
 * Renders a crisp SVG QR code matrix dummy
 */
export default function DummyQR({ seed = "K-ON", size = 180 }) {
  const N = 25;
  let h = 2166136261;
  for (const c of String(seed)) {
    h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  }
  const rand = () => {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    return h / 4294967296;
  };

  const inFinder = (x, y) =>
    (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);

  const cells = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (!inFinder(x, y) && rand() > 0.52) {
        cells.push(
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#1A1A2E" />
        );
      }
    }
  }

  const finder = (ox, oy) => (
    <g key={`f-${ox}-${oy}`}>
      <rect x={ox} y={oy} width="7" height="7" fill="#1A1A2E" />
      <rect x={ox + 1} y={oy + 1} width="5" height="5" fill="#FFFFFF" />
      <rect x={ox + 2} y={oy + 2} width="3" height="3" fill="#1A1A2E" />
    </g>
  );

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: "12px",
        borderRadius: "12px",
        border: "1px solid var(--border-default, #E5E7EB)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          fontSize: "0.75rem",
          fontWeight: 800,
          letterSpacing: "0.1em",
          color: "#DC2626",
          marginBottom: "6px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <span>QRIS</span>
        <span
          style={{
            fontSize: "0.625rem",
            backgroundColor: "#FEE2E2",
            color: "#DC2626",
            padding: "1px 4px",
            borderRadius: "4px",
            fontWeight: 600,
          }}
        >
          PEMBAYARAN
        </span>
      </div>
      <svg
        width={size}
        height={size}
        viewBox={`-1 -1 ${N + 2} ${N + 2}`}
        role="img"
        aria-label="Kode QRIS Dummy"
        shapeRendering="crispEdges"
      >
        <rect x="-1" y="-1" width={N + 2} height={N + 2} fill="#FFFFFF" />
        {cells}
        {finder(0, 0)}
        {finder(N - 7, 0)}
        {finder(0, N - 7)}
      </svg>
      <div
        style={{
          marginTop: "6px",
          fontSize: "0.6875rem",
          color: "var(--text-tertiary, #9CA3AF)",
          fontWeight: 500,
        }}
      >
        NMID: ID1020038849201
      </div>
    </div>
  );
}
