import {
  ArrowLeft,
  BarChart2,
  BookOpen,
  Briefcase,
  Calculator,
  ClipboardList,
  Construction,
  FileText,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "./coming-soon.css";

// ─── Module metadata keyed by path ────────────────────────────────────────────
const MODULE_META: Record<
  string,
  { label: string; description: string; Icon: React.ElementType; color: string }
> = {
  hrms: {
    label: "HRMS",
    description:
      "Human Resource Management System — manage employees, payroll, leaves, and attendance in one place.",
    Icon: Briefcase,
    color: "#7c3aed",
  },
  sales: {
    label: "Sales & Lease",
    description:
      "Track sales pipelines, lease agreements, renewals, and revenue analytics across all properties.",
    Icon: BarChart2,
    color: "#0891b2",
  },
  facilities: {
    label: "Facility Management",
    description:
      "Schedule maintenance, manage vendors, and monitor facility health metrics in real time.",
    Icon: Wrench,
    color: "#d97706",
  },
  legal: {
    label: "Legal & Documentations",
    description:
      "Store contracts, compliance records, and legal documents with version control and audit trails.",
    Icon: FileText,
    color: "#dc2626",
  },
  accounts: {
    label: "Accounts",
    description:
      "Full-featured accounting module with invoicing, expense tracking, and financial reporting.",
    Icon: Calculator,
    color: "#16a34a",
  },
  store: {
    label: "Store & Purchase",
    description:
      "Manage inventory, purchase orders, supplier relationships, and stock levels across locations.",
    Icon: ShoppingCart,
    color: "#ea580c",
  },
  reports: {
    label: "Reports",
    description:
      "Consolidated reporting across all modules — generate, schedule, and export custom reports.",
    Icon: BookOpen,
    color: "#2563eb",
  },
};

const FALLBACK = {
  label: "This Module",
  description: "We're working hard to bring this feature to you very soon.",
  Icon: ClipboardList,
  color: "#2563eb",
};

// ─── Animated dots ────────────────────────────────────────────────────────────
function ProgressDots({ color }: { color: string }) {
  return (
    <div className="cs-dots">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="cs-dot"
          style={{ background: color, animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function ComingSoonPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const segment = pathname.replace(/^\//, "").split("/")[0];
  const meta = MODULE_META[segment] ?? FALLBACK;
  const { label, description, Icon, color } = meta;

  return (
    <div className="cs-root">
      {/* Decorative background blobs */}
      <div className="cs-blob cs-blob--1" style={{ background: color }} />
      <div className="cs-blob cs-blob--2" style={{ background: color }} />

      <div className="cs-card">
        {/* Icon badge */}
        <div className="cs-icon-wrap" style={{ background: `${color}18`, border: `1.5px solid ${color}30` }}>
          <Icon size={32} style={{ color }} />
        </div>

        {/* Construction tag */}
        <div className="cs-tag">
          <Construction size={13} />
          <span>In Development</span>
        </div>

        <h1 className="cs-title">{label}</h1>
        <p className="cs-desc">{description}</p>

        <ProgressDots color={color} />

        <p className="cs-eta">Expected to launch in an upcoming release</p>

        <button className="cs-back" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={15} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
