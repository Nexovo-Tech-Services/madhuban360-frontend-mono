import { Eye, EyeOff, KeyRound, Mail, Phone, Save, UserCog, Users, X } from "lucide-react";
import { useState } from "react";
import { ROLES, roleBadgeStyle, statusDotColor, type User } from "./types";
import {
  getEmailError,
  getIndianMobileError,
  getRequiredError,
  validationStyles,
} from "../../utils/validation";

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

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
      {error ? <div style={validationStyles.errorText}>{error}</div> : null}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value?: string }) {
  return (
    <div style={styles.summaryItem}>
      <div style={styles.summaryLabel}>{label}</div>
      <div style={styles.summaryValue}>{value || "Not available"}</div>
    </div>
  );
}

export function EditUserModal({
  user,
  managers,
  supervisors,
  onClose,
  onSave,
  onResetPassword,
}: {
  user: User;
  managers: Array<{ id: string; name: string }>;
  supervisors: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSave: (u: User) => void;
  onResetPassword: (nextPassword: { password: string; confirmPassword: string }) => Promise<void>;
}) {
  const [form, setForm] = useState({
    fullName: user.name,
    email: user.email,
    phone: user.phone ?? "",
    role: user.role,
    status: user.status,
    department: user.department ?? "",
    managerId: user.managerId ?? "",
    supervisorId: user.supervisorId ?? "",
  });
  const [resetForm, setResetForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<"fullName" | "email" | "phone" | "managerId" | "supervisorId", string>>
  >({});
  const [resetErrors, setResetErrors] = useState<
    Partial<Record<"password" | "confirmPassword", string>>
  >({});
  const [resetLoading, setResetLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "fullName" || key === "email" || key === "phone" || key === "managerId" || key === "supervisorId") {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  function updateReset<K extends keyof typeof resetForm>(key: K, value: (typeof resetForm)[K]) {
    setResetForm((current) => ({ ...current, [key]: value }));
    setResetErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate() {
    const nextErrors: Partial<Record<"fullName" | "email" | "phone" | "managerId" | "supervisorId", string>> = {
      fullName: getRequiredError(form.fullName, "Please enter the user's full name.") ?? undefined,
      email: getEmailError(form.email) ?? undefined,
    };
    if (String(form.phone || "").trim()) {
      nextErrors.phone = getIndianMobileError(form.phone) ?? undefined;
    }
    if (form.role === "Supervisor") {
      nextErrors.managerId =
        getRequiredError(form.managerId, "Please select a manager for this supervisor.") ?? undefined;
    }
    if (form.role === "Staff") {
      nextErrors.supervisorId =
        getRequiredError(form.supervisorId, "Please select a supervisor for this staff member.") ?? undefined;
    }
    setErrors(nextErrors);
    return Object.values(nextErrors).every((value) => !value);
  }

  function validateReset() {
    const nextErrors: Partial<Record<"password" | "confirmPassword", string>> = {};
    if (!resetForm.password.trim()) {
      nextErrors.password = "Please enter a new password.";
    }
    if (!resetForm.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Please confirm the new password.";
    } else if (resetForm.password !== resetForm.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    setResetErrors(nextErrors);
    return Object.values(nextErrors).every((value) => !value);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...user,
      name: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      status: form.status,
      department: form.department.trim() || undefined,
      managerId: form.role === "Supervisor" ? form.managerId || undefined : undefined,
      managerName:
        form.role === "Supervisor"
          ? managers.find((item) => item.id === form.managerId)?.name
          : undefined,
      supervisorId: form.role === "Staff" ? form.supervisorId || undefined : undefined,
      supervisorName:
        form.role === "Staff"
          ? supervisors.find((item) => item.id === form.supervisorId)?.name
          : undefined,
    });
    onClose();
  }

  async function handleResetPassword() {
    if (!validateReset()) return;
    try {
      setResetLoading(true);
      await onResetPassword({
        password: resetForm.password,
        confirmPassword: resetForm.confirmPassword,
      });
      setResetForm({ password: "", confirmPassword: "" });
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={{ ...styles.avatar, background: user.avatarColor }}>{user.initials}</div>
            <div>
              <div style={styles.headerRow}>
                <h2 style={styles.title}>Edit User</h2>
                <span style={{ ...styles.rolePill, ...roleBadgeStyle(form.role) }}>{form.role}</span>
                <span style={styles.statusBadge}>
                  <span style={{ ...styles.statusDot, background: statusDotColor(form.status) }} />
                  {form.status}
                </span>
              </div>
              <div style={styles.metaRow}>
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
              </div>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} style={styles.form}>
          <div style={styles.grid}>
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>
                  <UserCog size={16} color="#2563eb" />
                </div>
                <div style={styles.cardTitle}>User Details</div>
              </div>

              <div style={styles.row2}>
                <Field label="Full Name" error={errors.fullName}>
                  <input
                    style={{ ...styles.input, ...(errors.fullName ? validationStyles.inputErrorBorder : null) }}
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                  />
                </Field>
                <Field label="Email Address" error={errors.email}>
                  <input
                    type="email"
                    style={{ ...styles.input, ...(errors.email ? validationStyles.inputErrorBorder : null) }}
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </Field>
              </div>

              <div style={styles.row2}>
                <Field label="Phone Number" error={errors.phone}>
                  <input
                    style={{ ...styles.input, ...(errors.phone ? validationStyles.inputErrorBorder : null) }}
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </Field>
                <Field label="Department">
                  <input
                    style={styles.input}
                    value={form.department}
                    onChange={(e) => update("department", e.target.value)}
                  />
                </Field>
              </div>

              <div style={styles.row2}>
                <Field label="Role">
                  <select
                    style={styles.input}
                    value={form.role}
                    onChange={(e) => update("role", e.target.value as typeof form.role)}
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    style={styles.input}
                    value={form.status}
                    onChange={(e) => update("status", e.target.value as typeof form.status)}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </Field>
              </div>

              {form.role === "Supervisor" ? (
                <Field label="Assigned Manager" error={errors.managerId}>
                  <select
                    style={{ ...styles.input, ...(errors.managerId ? validationStyles.inputErrorBorder : null) }}
                    value={form.managerId}
                    onChange={(e) => update("managerId", e.target.value)}
                  >
                    <option value="">Select a manager</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}

              {form.role === "Staff" ? (
                <Field label="Assigned Supervisor" error={errors.supervisorId}>
                  <select
                    style={{ ...styles.input, ...(errors.supervisorId ? validationStyles.inputErrorBorder : null) }}
                    value={form.supervisorId}
                    onChange={(e) => update("supervisorId", e.target.value)}
                  >
                    <option value="">Select a supervisor</option>
                    {supervisors.map((supervisor) => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {supervisor.name}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}
            </section>

            <section style={styles.sidebar}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardIcon}>
                    <Users size={16} color="#15803d" />
                  </div>
                  <div style={styles.cardTitle}>Account Summary</div>
                </div>
                <div style={styles.summaryGrid}>
                  <SummaryItem label="User ID" value={String(user.id)} />
                  <SummaryItem label="API Reference" value={user.apiId} />
                  <SummaryItem label="Created At" value={formatDate(user.createdAt)} />
                  <SummaryItem label="Manager" value={user.managerName} />
                  <SummaryItem label="Supervisor" value={user.supervisorName} />
                </div>
              </div>

              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardIcon}>
                    <KeyRound size={16} color="#d97706" />
                  </div>
                  <div style={styles.cardTitle}>Reset Password</div>
                </div>
                <div style={styles.resetSection}>
                  <Field label="Current Password">
                    <div style={styles.passwordFieldWrap}>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        style={{ ...styles.input, ...styles.passwordInput }}
                        value={user.password ?? ""}
                        readOnly
                      />
                      <button
                        type="button"
                        style={styles.passwordToggle}
                        onClick={() => setShowCurrentPassword((current) => !current)}
                        aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                      >
                        {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>
                  <Field label="New Password" error={resetErrors.password}>
                    <div style={styles.passwordFieldWrap}>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        style={{
                          ...styles.input,
                          ...styles.passwordInput,
                          ...(resetErrors.password ? validationStyles.inputErrorBorder : null),
                        }}
                        value={resetForm.password}
                        onChange={(e) => updateReset("password", e.target.value)}
                      />
                      <button
                        type="button"
                        style={styles.passwordToggle}
                        onClick={() => setShowNewPassword((current) => !current)}
                        aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      >
                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Confirm Password" error={resetErrors.confirmPassword}>
                    <div style={styles.passwordFieldWrap}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        style={{
                          ...styles.input,
                          ...styles.passwordInput,
                          ...(resetErrors.confirmPassword ? validationStyles.inputErrorBorder : null),
                        }}
                        value={resetForm.confirmPassword}
                        onChange={(e) => updateReset("confirmPassword", e.target.value)}
                      />
                      <button
                        type="button"
                        style={styles.passwordToggle}
                        onClick={() => setShowConfirmPassword((current) => !current)}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>
                  <button
                    type="button"
                    style={{ ...styles.resetBtn, ...(resetLoading ? styles.resetBtnDisabled : null) }}
                    onClick={() => void handleResetPassword()}
                    disabled={resetLoading}
                  >
                    <KeyRound size={14} />
                    {resetLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div style={styles.footer}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.saveBtn}>
              <Save size={14} /> Save Changes
            </button>
          </div>
        </form>
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
    maxWidth: 960,
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
    padding: "22px 24px 18px",
    borderBottom: "1px solid var(--c-divider)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    minWidth: 0,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: 800,
    flexShrink: 0,
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  title: {
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
  metaRow: {
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
  form: {
    overflowY: "auto",
    padding: 24,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.3fr) minmax(320px, 0.95fr)",
    gap: 18,
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
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
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 12,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  label: {
    fontSize: 12.5,
    fontWeight: 600,
    color: "var(--c-text-muted)",
  },
  input: {
    padding: "9px 12px",
    fontSize: 13.5,
    border: "1px solid var(--c-input-border)",
    borderRadius: 8,
    outline: "none",
    color: "var(--c-text)",
    background: "var(--c-card)",
    width: "100%",
    boxSizing: "border-box",
  },
  passwordFieldWrap: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 40,
  },
  passwordToggle: {
    position: "absolute",
    top: "50%",
    right: 10,
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    background: "transparent",
    color: "var(--c-text-muted)",
    cursor: "pointer",
    padding: 0,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  summaryItem: {
    padding: "12px 14px",
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
    fontSize: 13.5,
    fontWeight: 600,
    color: "var(--c-text)",
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  resetSection: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  resetBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    background: "#d97706",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  resetBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 18,
    paddingTop: 16,
    borderTop: "1px solid var(--c-divider)",
  },
  cancelBtn: {
    padding: "10px 18px",
    fontSize: 13.5,
    fontWeight: 700,
    border: "1px solid var(--c-input-border)",
    borderRadius: 10,
    background: "var(--c-card)",
    color: "var(--c-text-2)",
    cursor: "pointer",
  },
  saveBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 18px",
    fontSize: 13.5,
    fontWeight: 700,
    border: "none",
    borderRadius: 10,
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
};
