import { AlertTriangle, X } from "lucide-react";
import type { User } from "./types";

export function DeleteUserModal({
  user,
  onClose,
  onConfirm,
}: {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div style={ds.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={ds.card}>
        {/* Close */}
        <button style={ds.closeBtn} onClick={onClose}>
          <X size={16} />
        </button>

        {/* Icon + heading */}
        <div style={ds.iconWrap}>
          <AlertTriangle size={22} color="#dc2626" />
        </div>
        <h2 style={ds.title}>Delete User</h2>
        <p style={ds.body}>
          Are you sure you want to delete{" "}
          <strong style={{ color: "var(--c-text)" }}>{user.name}</strong>? This action
          cannot be undone. All associated data, activity logs, and permissions
          will be permanently removed from the database.
        </p>

        {/* User preview */}
        <div style={ds.userPreview}>
          <div style={{ ...ds.avatar, background: user.avatarColor }}>{user.initials}</div>
          <div>
            <div style={ds.previewName}>{user.name}</div>
            <div style={ds.previewMeta}>
              {user.email} · ID: USR-{String(9000 + user.id)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={ds.actions}>
          <button style={ds.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={ds.deleteBtn} onClick={() => { onConfirm(); onClose(); }}>
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}

const ds: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(15,23,42,0.6)",
    zIndex: 300,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%", maxWidth: 440,
    background: "var(--c-card)",
    border: "1px solid var(--c-card-border)",
    borderRadius: 16,
    padding: "28px 28px 24px",
    position: "relative" as const,
    boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
  },
  closeBtn: {
    position: "absolute" as const, top: 16, right: 16,
    width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
    border: "1px solid var(--c-input-border)", borderRadius: 8,
    background: "var(--c-card)",
    cursor: "pointer", color: "var(--c-text-muted)",
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: 12,
    background: "#fef2f2", border: "1px solid #fecaca",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  title: { margin: "0 0 10px", fontSize: 18, fontWeight: 800, color: "var(--c-text)" },
  body: { margin: "0 0 20px", fontSize: 13.5, color: "var(--c-text-2)", lineHeight: 1.65 },
  userPreview: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 14px",
    background: "var(--c-input-bg)",
    border: "1px solid var(--c-card-border)",
    borderRadius: 10,
    marginBottom: 22,
  },
  avatar: {
    width: 38, height: 38, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
  },
  previewName: { fontSize: 13.5, fontWeight: 700, color: "var(--c-text)" },
  previewMeta: { fontSize: 12, color: "var(--c-text-faint)", marginTop: 2 },
  actions: { display: "flex", gap: 10, justifyContent: "flex-end" },
  cancelBtn: {
    padding: "9px 22px", fontSize: 13.5, fontWeight: 600,
    border: "1px solid var(--c-input-border)", borderRadius: 8,
    background: "var(--c-card)", color: "var(--c-text-2)", cursor: "pointer",
  },
  deleteBtn: {
    padding: "9px 22px", fontSize: 13.5, fontWeight: 600,
    border: "none", borderRadius: 8,
    background: "#dc2626", color: "#ffffff", cursor: "pointer",
  },
};
