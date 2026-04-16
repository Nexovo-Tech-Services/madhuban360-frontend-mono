import {
  ClipboardList,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
  Warehouse,
} from "lucide-react";
import { type CSSProperties, type ElementType, type ReactNode, useEffect, useMemo, useState } from "react";
import { getAdminDashboard, type AdminDashboardResponse } from "@madhuban/api";
import {
  SkeletonBlock,
  SkeletonCardList,
  SkeletonMetricCard,
  SkeletonTheme,
} from "../components/Skeleton";
import { useNavigate } from "react-router-dom";
import { useShellHeader } from "../context/ShellHeaderContext";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function DashboardActions() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button style={cs.actionBtn} onClick={() => navigate("/tasks")}>
        <Plus size={14} />
        <span>Add Task</span>
      </button>
      <button style={cs.actionBtn} onClick={() => navigate("/users")}>
        <UserPlus size={14} />
        <span>Add User</span>
      </button>
      <button style={cs.actionBtn} onClick={() => navigate("/properties")}>
        <Warehouse size={14} />
        <span>Add Property</span>
      </button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <SkeletonTheme />
      <div style={cs.pageHeader}>
        <div>
          <SkeletonBlock width={220} height={28} />
          <SkeletonBlock width={280} height={12} style={{ marginTop: 10 }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <SkeletonBlock width={104} height={36} radius={10} />
          <SkeletonBlock width={104} height={36} radius={10} />
          <SkeletonBlock width={120} height={36} radius={10} />
        </div>
      </div>

      <div style={cs.metricsGrid}>
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonMetricCard key={index} />
        ))}
      </div>

      <div style={cs.sectionGrid}>
        <div style={cs.card}>
          <div style={cs.cardHeader}>
            <SkeletonBlock width={140} height={16} />
          </div>
          <SkeletonCardList count={4} />
        </div>
        <div style={cs.card}>
          <div style={cs.cardHeader}>
            <SkeletonBlock width={120} height={16} />
          </div>
          <SkeletonCardList count={4} />
        </div>
        <div style={cs.card}>
          <div style={cs.cardHeader}>
            <SkeletonBlock width={132} height={16} />
          </div>
          <SkeletonCardList count={5} lines={2} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  iconBg,
  label,
  value,
  sub,
  extra,
}: {
  icon: ElementType;
  iconBg: string;
  label: string;
  value: string | number;
  sub?: string;
  extra?: ReactNode;
}) {
  return (
    <div style={cs.metricCard}>
      <div style={cs.metricHeader}>
        <div style={{ ...cs.metricIcon, background: iconBg }}>
          <Icon size={18} color="#fff" />
        </div>
      </div>
      <div style={cs.metricLabel}>{label}</div>
      <div style={cs.metricValue}>{value}</div>
      {sub ? <div style={cs.metricSub}>{sub}</div> : null}
      {extra}
    </div>
  );
}

function KeyValueRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warn";
}) {
  return (
    <div style={cs.keyValueRow}>
      <span style={cs.keyValueLabel}>{label}</span>
      <span
        style={{
          ...cs.keyValueValue,
          color:
            tone === "success"
              ? "#15803d"
              : tone === "warn"
                ? "#b45309"
                : "var(--c-text)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div style={cs.emptyState}>
      <div style={cs.emptyTitle}>{title}</div>
      <div style={cs.emptyDescription}>{description}</div>
    </div>
  );
}

export function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  useShellHeader({ showSearch: true });

  useEffect(() => {
    let active = true;
    setLoading(true);

    getAdminDashboard()
      .then((data) => {
        if (active) {
          setDashboard(data);
        }
      })
      .catch(() => {
        if (active) {
          setDashboard(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const attendancePercent = dashboard?.attendanceToday.percent ?? 0;
  const attendanceTotal =
    (dashboard?.attendanceToday.present ?? 0) + (dashboard?.attendanceToday.absent ?? 0);
  const usersByRole = useMemo(
    () =>
      dashboard
        ? [
            { label: "Admins", value: dashboard.kpis.usersByRole.admin },
            { label: "Managers", value: dashboard.kpis.usersByRole.manager },
            { label: "Supervisors", value: dashboard.kpis.usersByRole.supervisor },
            { label: "Staff", value: dashboard.kpis.usersByRole.staff },
          ]
        : [],
    [dashboard],
  );

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!dashboard) {
    return (
      <div>
        <div style={cs.pageHeader}>
          <div>
            <h1 style={cs.pageTitle}>Dashboard Overview</h1>
            <p style={cs.pageSubtitle}>Unable to load admin dashboard right now.</p>
          </div>
          <DashboardActions />
        </div>
        <div style={cs.card}>
          <EmptyState
            title="Dashboard unavailable"
            description="The admin dashboard API did not return data. Refresh the page after the backend is available."
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={cs.pageHeader}>
        <div>
          <h1 style={cs.pageTitle}>Dashboard Overview</h1>
          <p style={cs.pageSubtitle}>
            {dashboard.profile.name} · {dashboard.profile.role} · {formatDate(dashboard.date)}
          </p>
        </div>
        <DashboardActions />
      </div>

      <div style={cs.metricsGrid}>
        <MetricCard
          icon={Warehouse}
          iconBg="#6366f1"
          label="Total Properties"
          value={dashboard.kpis.propertiesTotal}
          sub={`Selected property filter: ${
            dashboard.filters.propertyId === null ? "All properties" : `Property #${dashboard.filters.propertyId}`
          }`}
        />
        <MetricCard
          icon={Users}
          iconBg="#0ea5e9"
          label="Total Users"
          value={dashboard.kpis.usersTotal}
          sub={`${dashboard.kpis.usersByRole.manager} managers · ${dashboard.kpis.usersByRole.supervisor} supervisors · ${dashboard.kpis.usersByRole.staff} staff`}
        />
        <MetricCard
          icon={ClipboardList}
          iconBg="#f59e0b"
          label="Master Tasks"
          value={dashboard.kpis.masterTasksTotal}
          sub={`${dashboard.kpis.dailyTasks.assigned} daily tasks assigned`}
        />
        <MetricCard
          icon={TrendingUp}
          iconBg="#10b981"
          label="Today's Attendance"
          value={`${attendancePercent}%`}
          sub={`${dashboard.attendanceToday.present} present · ${dashboard.attendanceToday.absent} absent`}
          extra={
            <div style={{ marginTop: 10 }}>
              <div style={cs.progressTrack}>
                <div
                  style={{
                    ...cs.progressFill,
                    width: `${attendancePercent}%`,
                  }}
                />
              </div>
              <div style={cs.metricFootnote}>
                {attendanceTotal > 0 ? `${attendanceTotal} tracked users` : "No attendance records yet"}
              </div>
            </div>
          }
        />
      </div>

      <div style={cs.sectionGrid}>
        <div style={cs.card}>
          <div style={cs.cardHeader}>
            <span style={cs.cardTitle}>Daily Tasks</span>
            <span style={cs.cardMeta}>{formatDate(dashboard.filters.date)}</span>
          </div>
          <div style={cs.keyValueList}>
            <KeyValueRow label="Assigned" value={dashboard.kpis.dailyTasks.assigned} />
            <KeyValueRow label="Open" value={dashboard.kpis.dailyTasks.open} tone="warn" />
            <KeyValueRow label="Pending" value={dashboard.kpis.dailyTasks.pending} tone="warn" />
            <KeyValueRow label="Completed" value={dashboard.kpis.dailyTasks.completed} tone="success" />
          </div>
        </div>

        <div style={cs.card}>
          <div style={cs.cardHeader}>
            <span style={cs.cardTitle}>Users By Role</span>
            <span style={cs.cardMeta}>{dashboard.kpis.usersTotal} total</span>
          </div>
          <div style={cs.keyValueList}>
            {usersByRole.map((item) => (
              <KeyValueRow key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </div>

        <div style={cs.card}>
          <div style={cs.cardHeader}>
            <span style={cs.cardTitle}>Admin Context</span>
            <span style={cs.cardMeta}>{dashboard.profile.initials}</span>
          </div>
          <div style={cs.keyValueList}>
            <KeyValueRow label="Admin" value={dashboard.profile.name} />
            <KeyValueRow label="Role" value={dashboard.profile.role} />
            <KeyValueRow label="Report Date" value={formatDate(dashboard.date)} />
            <KeyValueRow
              label="Attendance Snapshot"
              value={`${dashboard.attendanceToday.present} present / ${attendanceTotal || 0} total`}
            />
            <KeyValueRow
              label="Property Filter"
              value={
                dashboard.filters.propertyId === null ? "All properties" : `Property #${dashboard.filters.propertyId}`
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const cs: Record<string, CSSProperties> = {
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 16,
    flexWrap: "wrap",
  },
  pageTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "var(--c-text)",
    letterSpacing: "-0.3px",
  },
  pageSubtitle: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "var(--c-text-muted)",
  },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 600,
    border: "1px solid var(--c-input-border)",
    borderRadius: 8,
    background: "var(--c-card)",
    color: "var(--c-text-2)",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 20,
  },
  metricCard: {
    background: "var(--c-card)",
    border: "1px solid var(--c-card-border)",
    borderRadius: 14,
    padding: 18,
  },
  metricHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    fontSize: 12.5,
    color: "var(--c-text-muted)",
    fontWeight: 500,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 800,
    color: "var(--c-text)",
    letterSpacing: "-0.5px",
    lineHeight: 1.1,
  },
  metricSub: {
    fontSize: 12,
    color: "var(--c-text-faint)",
    marginTop: 4,
    lineHeight: 1.45,
  },
  metricFootnote: {
    marginTop: 8,
    fontSize: 11.5,
    color: "var(--c-text-faint)",
  },
  progressTrack: {
    height: 6,
    borderRadius: 99,
    background: "var(--c-input-border)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#10b981",
    borderRadius: 99,
  },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
  },
  card: {
    background: "var(--c-card)",
    border: "1px solid var(--c-card-border)",
    borderRadius: 14,
    padding: 20,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: 700,
    color: "var(--c-text)",
  },
  cardMeta: {
    fontSize: 12,
    color: "var(--c-text-faint)",
    fontWeight: 500,
  },
  keyValueList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  keyValueRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 10,
    borderBottom: "1px solid var(--c-divider)",
  },
  keyValueLabel: {
    fontSize: 12.5,
    color: "var(--c-text-muted)",
    fontWeight: 500,
  },
  keyValueValue: {
    fontSize: 13,
    fontWeight: 700,
  },
  emptyState: {
    padding: "8px 4px",
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--c-text)",
  },
  emptyDescription: {
    marginTop: 6,
    fontSize: 12.5,
    color: "var(--c-text-muted)",
    lineHeight: 1.5,
  },
};
