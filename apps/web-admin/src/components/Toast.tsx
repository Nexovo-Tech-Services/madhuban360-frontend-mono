import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast, type ToastItem, type ToastType } from "../context/ToastContext";

// ─── Per-type visual config ───────────────────────────────────────────────────
const CONFIG: Record<
  ToastType,
  { icon: React.ElementType; iconColor: string; iconBg: string; border: string }
> = {
  success: { icon: CheckCircle2, iconColor: "#16a34a", iconBg: "#dcfce7", border: "#bbf7d0" },
  error:   { icon: AlertCircle,  iconColor: "#dc2626", iconBg: "#fee2e2", border: "#fecaca" },
  warning: { icon: AlertTriangle,iconColor: "#d97706", iconBg: "#fef3c7", border: "#fde68a" },
  info:    { icon: Info,         iconColor: "#2563eb", iconBg: "#dbeafe", border: "#bfdbfe" },
};

// ─── Single toast card ────────────────────────────────────────────────────────
function ToastCard({ toast }: { toast: ToastItem }) {
  const { dismiss } = useToast();
  const [visible, setVisible] = useState(false);
  const cfg = CONFIG[toast.type];
  const Icon = cfg.icon;

  // Slide-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  function handleDismiss() {
    setVisible(false);
    setTimeout(() => dismiss(toast.id), 250);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        background: "#ffffff",
        border: `1px solid ${cfg.border}`,
        borderRadius: 14,
        padding: "14px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
        minWidth: 300,
        maxWidth: 380,
        transition: "opacity 0.25s, transform 0.25s",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(24px)",
        pointerEvents: "all",
      }}
    >
      {/* Icon circle */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: cfg.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={19} color={cfg.iconColor} strokeWidth={2.5} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>
          {toast.title}
        </div>
        {toast.subtitle && (
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            {toast.subtitle}
          </div>
        )}
      </div>

      {/* Close */}
      <button
        onClick={handleDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#94a3b8",
          display: "flex",
          alignItems: "center",
          padding: 2,
          borderRadius: 6,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}

// ─── Toast container (rendered once at app level) ─────────────────────────────
export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} />
      ))}
    </div>
  );
}
