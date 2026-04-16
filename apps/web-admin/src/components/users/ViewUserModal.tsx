import {
  CalendarClock,
  KeyRound,
  Mail,
  Phone,
  Shield,
  User,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { roleBadgeStyle, statusDotColor, type User as UserType } from "./types";

function formatDate(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getRoleSummary(user: UserType) {
  if (user.role === "Admin") return "Global system access across properties, users, and master tasks.";
  if (user.role === "Manager") return "Operational oversight with supervisor and review visibility.";
  if (user.role === "Supervisor") return "Field review access for assigned teams and task verification.";
  return "Task execution access with reporting routed through the assigned chain.";
}

function getReportsTo(user: UserType) {
  if (user.supervisorName) return user.supervisorName;
  if (user.managerName) return user.managerName;
  return "Not assigned";
}

function getHierarchyRows(user: UserType) {
  return [
    { label: "Manager", value: user.managerName ?? "Not assigned" },
    { label: "Supervisor", value: user.supervisorName ?? "Not assigned" },
    { label: "Reports To", value: getReportsTo(user) },
    { label: "Department", value: user.department ?? "Not specified" },
  ];
}

function getPasswordMeta(password?: string) {
  if (!password) {
    return {
      algorithm: "Not available",
      cost: "Not available",
      length: "0 chars",
    };
  }
  const parts = password.split("$");
  return {
    algorithm: parts[1] ? parts[1].toUpperCase() : "Stored hash",
    cost: parts[2] ? `Cost ${parts[2]}` : "Stored hash",
    length: `${password.length} chars`,
  };
}

function InfoPair({ label, value }: { label: string; value?: string }) {
  return (
    <div style={styles.infoPair}>
      <div style={styles.infoLabel}>{label}</div>
      <div style={styles.infoValue}>{value || "Not available"}</div>
    </div>
  );
}

function DetailCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.cardIcon}>{icon}</div>
        <div>
          <div style={styles.cardTitle}>{title}</div>
          {subtitle ? <div style={styles.cardSubtitle}>{subtitle}</div> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function ViewUserModal({
  user,
  onClose,
  onEdit,
}: {
  user: UserType;
  onClose: () => void;
  onEdit: () => void;
}) {
  const passwordMeta = getPasswordMeta(user.password);
  const createdAt = formatDate(user.createdAt);

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={{ ...styles.avatar, background: user.avatarColor }}>{user.initials}</div>
            <div style={styles.identity}>
              <div style={styles.identityRow}>
                <h2 style={styles.name}>{user.name}</h2>
                <span style={{ ...styles.rolePill, ...roleBadgeStyle(user.role) }}>{user.role}</span>
                <span style={styles.statusBadge}>
                  <span style={{ ...styles.statusDot, background: statusDotColor(user.status) }} />
                  {user.status}
                </span>
              </div>
              <div style={styles.identityMeta}>
                <span style={styles.metaItem}>
                  <Mail size={13} />
                  {user.email}
                </span>
                {user.phone ? (
                  <span style={styles.metaItem}>
                    <Phone size={13} />
                    {user.phone}
                  </span>
                ) : null}
                <span style={styles.metaItem}>
                  <CalendarClock size={13} />
                  Created {createdAt}
                </span>
              </div>
              <p style={styles.identitySummary}>{getRoleSummary(user)}</p>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.editBtn} onClick={onEdit}>
              <User size={14} /> Edit User
            </button>
            <button style={styles.closeBtn} onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.grid}>
            <DetailCard
              icon={<UserCog size={16} color="#2563eb" />}
              title="Account Snapshot"
              subtitle="Rendered entirely from the current API response."
            >
              <div style={styles.infoGrid}>
                <InfoPair label="User ID" value={String(user.id)} />
                <InfoPair label="API Reference" value={user.apiId} />
                <InfoPair label="Email Handle" value={user.email.split("@")[0] || user.email} />
                <InfoPair label="Created At" value={createdAt} />
              </div>
            </DetailCard>

            <DetailCard
              icon={<Users size={16} color="#15803d" />}
              title="Reporting Chain"
              subtitle="Current assignment and escalation path."
            >
              <div style={styles.infoGrid}>
                {getHierarchyRows(user).map((row) => (
                  <InfoPair key={row.label} label={row.label} value={row.value} />
                ))}
              </div>
            </DetailCard>

            <DetailCard
              icon={<Shield size={16} color="#7c3aed" />}
              title="Access Profile"
              subtitle="Role and status reused across multiple detail blocks."
            >
              <div style={styles.summaryGrid}>
                <div style={styles.summaryCard}>
                  <div style={styles.summaryLabel}>Current Role</div>
                  <div style={styles.summaryValue}>{user.role}</div>
                </div>
                <div style={styles.summaryCard}>
                  <div style={styles.summaryLabel}>Status</div>
                  <div style={styles.summaryValue}>{user.status}</div>
                </div>
                <div style={styles.summaryCard}>
                  <div style={styles.summaryLabel}>Department</div>
                  <div style={styles.summaryValue}>{user.department ?? "Not specified"}</div>
                </div>
              </div>
            </DetailCard>

            <DetailCard
              icon={<KeyRound size={16} color="#d97706" />}
              title="Stored Password"
              subtitle="Showing the exact password value returned by the API."
            >
              <div style={styles.passwordMetaRow}>
                <span style={styles.metaBadge}>{passwordMeta.algorithm}</span>
                <span style={styles.metaBadge}>{passwordMeta.cost}</span>
                <span style={styles.metaBadge}>{passwordMeta.length}</span>
              </div>
              <pre style={styles.passwordBlock}>{user.password ?? "Not available"}</pre>
            </DetailCard>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  panel: {
    width: "100%",
    maxWidth: 980,
    maxHeight: "92vh",
    background: "var(--c-card)",
    border: "1px solid var(--c-card-border)",
    borderRadius: 18,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
  },
  header: {
    padding: "24px 24px 18px",
    borderBottom: "1px solid var(--c-divider)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  headerLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 20,
    fontWeight: 800,
    flexShrink: 0,
  },
  identity: { flex: 1, minWidth: 0 },
  identityRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  name: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "var(--c-text)",
  },
  rolePill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 999,
    background: "#f8fafc",
    border: "1px solid var(--c-card-border)",
    color: "var(--c-text-2)",
    fontSize: 12,
    fontWeight: 700,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
  },
  identityMeta: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 8,
    color: "var(--c-text-muted)",
    fontSize: 12.5,
  },
  metaItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  identitySummary: {
    margin: "10px 0 0",
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--c-text-muted)",
    maxWidth: 720,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  editBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 14px",
    fontSize: 13,
    fontWeight: 700,
    borderRadius: 10,
    border: "1px solid var(--c-input-border)",
    background: "var(--c-card)",
    color: "var(--c-text)",
    cursor: "pointer",
  },
  closeBtn: {
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    border: "1px solid var(--c-input-border)",
    background: "var(--c-card)",
    color: "var(--c-text-muted)",
    cursor: "pointer",
  },
  content: {
    overflowY: "auto",
    padding: 24,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  card: {
    background: "var(--c-input-bg)",
    border: "1px solid var(--c-card-border)",
    borderRadius: 14,
    padding: 18,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--c-card)",
    border: "1px solid var(--c-card-border)",
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "var(--c-text)",
  },
  cardSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "var(--c-text-muted)",
    lineHeight: 1.5,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  infoPair: {
    padding: "12px 14px",
    background: "var(--c-card)",
    border: "1px solid var(--c-card-border)",
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--c-text-faint)",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 13.5,
    fontWeight: 600,
    color: "var(--c-text)",
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  summaryCard: {
    padding: "14px 12px",
    background: "var(--c-card)",
    border: "1px solid var(--c-card-border)",
    borderRadius: 12,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--c-text-faint)",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--c-text)",
    lineHeight: 1.4,
  },
  passwordMetaRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  metaBadge: {
    padding: "4px 10px",
    borderRadius: 999,
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: 700,
  },
  passwordBlock: {
    margin: 0,
    padding: 14,
    borderRadius: 12,
    background: "#0f172a",
    color: "#e2e8f0",
    fontSize: 12,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    overflowX: "auto",
  },
};
