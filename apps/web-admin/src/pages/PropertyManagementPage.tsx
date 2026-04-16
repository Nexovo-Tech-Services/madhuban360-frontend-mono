import {
  BarChart2,
  BookOpen,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  Filter,
  LayoutGrid,
  Map,
  MapPin,
  Pencil,
  Plus,
  Search,
  Settings,
  Shield,
  Thermometer,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wind,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useShellHeader } from "../context/ShellHeaderContext";
import { useToast } from "../context/ToastContext";
import {
  createProperty,
  deleteProperty,
  getAssetSummary,
  getAssets,
  getProperties,
  getPropertySummary,
  getReports,
  getTasks,
  updateProperty,
} from "@madhuban/api";
import { SkeletonBlock, SkeletonCardList, SkeletonTheme } from "../components/Skeleton";
import {
  getRequiredError,
  validationStyles,
} from "../utils/validation";

// ─── Types ────────────────────────────────────────────────────────────────────
type PropertyType = "Commercial" | "Residential" | "Industrial";
type AMCStatus = "Active" | "Expiring Soon" | "Expired";
type WOPriority = "Emergency" | "High" | "Medium" | "Low";
type WOStatus = "In Progress" | "New" | "Assigned" | "On Hold" | "Completed";
type AssetCondition = "Excellent" | "Good" | "Fair" | "Poor";
type MainTab = "list" | "workorders" | "assets" | "reports";
type ReportTab = "overview" | "financial" | "operational" | "sustainability";

interface Property {
  id: number; apiId?: string; name: string; address: string; type: PropertyType;
  amcStatus: AMCStatus;
  gradFrom: string; gradTo: string;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
interface WorkOrder {
  id: string; description: string; descSub: string;
  priority: WOPriority; status: WOStatus;
  staff: string | null; dueDate: string;
}
interface Asset {
  id: number; name: string; icon: string; location: string;
  condition: AssetCondition; lastMaint: string; nextService: string; overdue?: boolean;
}

type PropertySummary = { total: number; activeAmc: number; expiringAmc: number };
type AssetSummary = { total: number; needsAttention: number; upcomingService: number; uptimeRate: number };

// ─── Mock data ────────────────────────────────────────────────────────────────
const PROPERTIES: Property[] = [
  { id:1, name:"Grand Plaza Office Tower",  address:"Downtown Financial District, NY",   type:"Commercial",  amcStatus:"Active",       gradFrom:"#1e3a5f", gradTo:"#2563eb" },
  { id:2, name:"Blue Water Residences",     address:"Bayfront Avenue, Miami",            type:"Residential", amcStatus:"Active",       gradFrom:"#14532d", gradTo:"#16a34a" },
  { id:3, name:"Metro Logistics Hub",       address:"CargaPort Drive, Chicago",          type:"Industrial",  amcStatus:"Expiring Soon",gradFrom:"#7c2d12", gradTo:"#ea580c" },
  { id:4, name:"The Innovation Center",     address:"Tech Park, San Jose",               type:"Commercial",  amcStatus:"Expiring Soon",gradFrom:"#312e81", gradTo:"#7c3aed" },
  { id:5, name:"Green Meadows Villas",      address:"Suburban Hills, Austin",            type:"Residential", amcStatus:"Active",       gradFrom:"#064e3b", gradTo:"#059669" },
];

const WORK_ORDERS: WorkOrder[] = [
  { id:"#WO-1024", description:"HVAC repair in...",         descSub:"AC unit on annual routing check",           priority:"Emergency", status:"In Progress", staff:"Marcus Chen",     dueDate:"Oct 24, 2023" },
  { id:"#WO-1025", description:"Leaking pipe in...",        descSub:"Pipe burst on floor 3, wing B",             priority:"High",      status:"New",         staff:null,              dueDate:"Oct 25, 2023" },
  { id:"#WO-1026", description:"Broken window...",          descSub:"Window panel 4, north façade",              priority:"Medium",    status:"Assigned",    staff:"Sarah Miller",    dueDate:"Oct 28, 2023" },
  { id:"#WO-1027", description:"Annual Fire...",            descSub:"Scheduled maintenance for all floors",      priority:"Low",       status:"On Hold",     staff:"Jim Peters",      dueDate:"Nov 02, 2023" },
  { id:"#WO-1028", description:"Elevator S...",             descSub:"Monthly safety audit complete",             priority:"High",      status:"Completed",   staff:"Elena Rodriguez", dueDate:"Oct 20, 2023" },
];

const ASSETS: Asset[] = [
  { id:1, name:"Chiller Unit #2",  icon:"thermometer", location:"Roof West – Section A",   condition:"Excellent", lastMaint:"Oct 12, 2023", nextService:"Jan 15, 2024" },
  { id:2, name:"Elevator B",       icon:"zap",         location:"Main Lobby – South Bank", condition:"Good",      lastMaint:"Nov 01, 2023", nextService:"Feb 05, 2024" },
  { id:3, name:"Generator 01",     icon:"zap",         location:"Basement Mech Room",       condition:"Fair",      lastMaint:"Sep 20, 2023", nextService:"Dec 20, 2023", overdue:true },
  { id:4, name:"Exhaust Fan #12",  icon:"wind",        location:"North Wing – Attic",       condition:"Poor",      lastMaint:"Aug 13, 2023", nextService:"ASAP",        overdue:true },
];

const REPORTS = [
  { id:1, name:"Q3 Financial Audit 2023",         icon:"file",     category:"Financial",     catColor:"#1d4ed8", catBg:"#eff6ff", date:"Oct 24, 2023" },
  { id:2, name:"Monthly Energy Log - Portfolio",   icon:"zap",      category:"Sustainability", catColor:"#15803d", catBg:"#f0fdf4", date:"Oct 20, 2023" },
  { id:3, name:"HVAC Maintenance Performance",     icon:"settings", category:"Operational",   catColor:"#475569", catBg:"#f8fafc", date:"Oct 18, 2023" },
  { id:4, name:"Security Incident Annual Review",  icon:"shield",   category:"Operational",   catColor:"#475569", catBg:"#f8fafc", date:"Oct 15, 2023" },
];

// ─── Icon helpers (replaces emoji usage) ─────────────────────────────────────
function AssetIcon({ icon }: { icon: string }) {
  const map: Record<string, React.ElementType> = {
    thermometer: Thermometer, zap: Zap, wind: Wind, wrench: Wrench,
  };
  const Icon = map[icon] ?? Wrench;
  return <Icon size={15} color="#2563eb" />;
}
function ReportIcon({ icon }: { icon: string }) {
  const map: Record<string, React.ElementType> = {
    file: FileText, zap: Zap, settings: Settings, shield: Shield,
  };
  const Icon = map[icon] ?? FileText;
  return <Icon size={15} color="#64748b" />;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function Badge({ label, bg, color, border }: { label: string; bg: string; color: string; border?: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: bg, color, border: `1px solid ${border ?? bg}` }}>
      {label}
    </span>
  );
}

function StatMini({ label, value, trend, trendUp }: { label: string; value: string | number; trend?: string; trendUp?: boolean }) {
  return (
    <div style={sh.statMini}>
      <div style={sh.statMiniLabel}>{label}</div>
      <div style={sh.statMiniValue}>{value}</div>
      {trend && (
        <div style={{ fontSize: 11, fontWeight: 600, color: trendUp ? "#16a34a" : "#dc2626", display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
          {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {trend}
        </div>
      )}
    </div>
  );
}

// ─── SVG Donut chart ──────────────────────────────────────────────────────────
function DonutChart({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 44; const cx = 56; const cy = 56;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg viewBox="0 0 112 112" style={{ width: 112, height: 112 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--c-row-border)" strokeWidth={12} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={12}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 56 56)" />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 13, fontWeight: 800, fill: "var(--c-text)" }}>{label}</text>
    </svg>
  );
}

// ─── Priority / Status helpers ────────────────────────────────────────────────
function priorityBadge(p: WOPriority) {
  const m: Record<WOPriority, [string, string]> = {
    Emergency: ["#dc2626", "#fef2f2"], High: ["#d97706", "#fffbeb"],
    Medium: ["#ca8a04", "#fefce8"], Low: ["#64748b", "#f8fafc"],
  };
  return <Badge label={p} color={m[p][0]} bg={m[p][1]} />;
}
function statusBadge(s: WOStatus) {
  const m: Record<WOStatus, [string, string]> = {
    "In Progress": ["#2563eb", "#eff6ff"], New: ["#64748b", "#f8fafc"],
    Assigned: ["#7c3aed", "#f5f3ff"], "On Hold": ["#d97706", "#fffbeb"],
    Completed: ["#16a34a", "#f0fdf4"],
  };
  return <Badge label={s} color={m[s][0]} bg={m[s][1]} />;
}
function conditionBadge(c: AssetCondition) {
  const m: Record<AssetCondition, [string, string]> = {
    Excellent: ["#16a34a", "#f0fdf4"], Good: ["#2563eb", "#eff6ff"],
    Fair: ["#d97706", "#fffbeb"], Poor: ["#dc2626", "#fef2f2"],
  };
  return <Badge label={c} color={m[c][0]} bg={m[c][1]} />;
}
function woAction(s: WOStatus) {
  const m: Record<WOStatus, string> = {
    "In Progress": "View", New: "Assign", Assigned: "View", "On Hold": "Resume", Completed: "History",
  };
  return m[s];
}

// ─── Add Property Modal ───────────────────────────────────────────────────────
interface PropertyZoneDraft {
  name: string;
}

interface PropertyFloorDraft {
  floorNumber: string;
  zones: PropertyZoneDraft[];
}

interface PropertyFormState {
  propertyName: string;
  floors: PropertyFloorDraft[];
  image: File | null;
}

const EMPTY_PROP: PropertyFormState = {
  propertyName: "",
  floors: [{ floorNumber: "1", zones: [{ name: "" }] }],
  image: null,
};

function PropertyModal({
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial?: Partial<PropertyFormState>;
  onClose: () => void;
  onSubmit: (form: PropertyFormState) => Promise<void>;
}) {
  const [form, setForm] = useState<PropertyFormState>({ ...EMPTY_PROP, ...initial });
  const [errors, setErrors] = useState<Partial<Record<"propertyName" | "floors", string>>>({});
  const [saving, setSaving] = useState(false);

  function set<K extends keyof PropertyFormState>(key: K, value: PropertyFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function updateFloor(index: number, next: PropertyFloorDraft) {
    setForm((current) => ({
      ...current,
      floors: current.floors.map((floor, floorIndex) => (floorIndex === index ? next : floor)),
    }));
    setErrors((current) => ({ ...current, floors: undefined }));
  }

  function addFloor() {
    setForm((current) => ({
      ...current,
      floors: [
        ...current.floors,
        { floorNumber: String(current.floors.length + 1), zones: [{ name: "" }] },
      ],
    }));
  }

  function removeFloor(index: number) {
    setForm((current) => ({
      ...current,
      floors: current.floors.filter((_, floorIndex) => floorIndex !== index),
    }));
  }

  function addZone(floorIndex: number) {
    setForm((current) => ({
      ...current,
      floors: current.floors.map((floor, index) =>
        index === floorIndex ? { ...floor, zones: [...floor.zones, { name: "" }] } : floor,
      ),
    }));
  }

  function removeZone(floorIndex: number, zoneIndex: number) {
    setForm((current) => ({
      ...current,
      floors: current.floors.map((floor, index) =>
        index === floorIndex
          ? { ...floor, zones: floor.zones.filter((_, currentZoneIndex) => currentZoneIndex !== zoneIndex) }
          : floor,
      ),
    }));
  }

  function validate() {
    const nextErrors: Partial<Record<"propertyName" | "floors", string>> = {
      propertyName: getRequiredError(form.propertyName, "Please enter the property name.") ?? undefined,
    };
    if (form.floors.some((floor) => !floor.floorNumber.trim() || floor.zones.some((zone) => !zone.name.trim()))) {
      nextErrors.floors = "Each floor and zone needs a name before saving.";
    }
    setErrors(nextErrors);
    return Object.values(nextErrors).every((value) => !value);
  }

  async function handleSubmit() {
    if (!validate()) return;
    try {
      setSaving(true);
      await onSubmit(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={ap.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={ap.panel}>
        <div style={ap.header}>
          <div>
            <h2 style={ap.title}>{mode === "create" ? "Add Property" : "Edit Property"}</h2>
            <p style={ap.sub}>
              {mode === "create"
                ? "Create a property record and optionally upload an image."
                : "Update the selected property details."}
            </p>
          </div>
          <button style={ap.closeBtn} onClick={onClose}><X size={17} /></button>
        </div>
        <div style={ap.body}>
          <Section icon={<Building2 size={14} />} label="Property Details">
            <Field label="Property Name" error={errors.propertyName}>
              <input
                style={{ ...ap.input, ...(errors.propertyName ? validationStyles.inputErrorBorder : null) }}
                placeholder="e.g. Skyline Heights"
                value={form.propertyName}
                onChange={(e) => set("propertyName", e.target.value)}
              />
            </Field>
          </Section>

          {mode === "create" ? (
            <Section icon={<Map size={14} />} label="Floors & Zones">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12.5, color: "var(--c-text-muted)" }}>
                  Add each floor and the zones that belong to it.
                </div>
                <button type="button" style={ap.secondaryBtn} onClick={addFloor}>
                  <Plus size={14} /> Add Floor
                </button>
              </div>
              {errors.floors ? <div style={validationStyles.errorText}>{errors.floors}</div> : null}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {form.floors.map((floor, floorIndex) => (
                  <div key={`${floorIndex}-${floor.floorNumber}`} style={ap.floorCard}>
                    <div style={ap.floorHeader}>
                      <Field label="Floor Number">
                        <input
                          style={ap.input}
                          value={floor.floorNumber}
                          onChange={(e) =>
                            updateFloor(floorIndex, { ...floor, floorNumber: e.target.value })
                          }
                        />
                      </Field>
                      <button
                        type="button"
                        style={{ ...ap.secondaryBtn, color: "#dc2626", borderColor: "#fecaca" }}
                        onClick={() => removeFloor(floorIndex)}
                        disabled={form.floors.length === 1}
                      >
                        <Trash2 size={14} /> Remove Floor
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {floor.zones.map((zone, zoneIndex) => (
                        <div key={`${floorIndex}-${zoneIndex}`} style={ap.zoneRow}>
                          <Field label={`Zone ${zoneIndex + 1}`}>
                            <input
                              style={ap.input}
                              placeholder="e.g. Zone A"
                              value={zone.name}
                              onChange={(e) =>
                                updateFloor(floorIndex, {
                                  ...floor,
                                  zones: floor.zones.map((currentZone, currentIndex) =>
                                    currentIndex === zoneIndex
                                      ? { ...currentZone, name: e.target.value }
                                      : currentZone,
                                  ),
                                })
                              }
                            />
                          </Field>
                          <button
                            type="button"
                            style={{ ...ap.secondaryBtn, color: "#dc2626", borderColor: "#fecaca", marginTop: 22 }}
                            onClick={() => removeZone(floorIndex, zoneIndex)}
                            disabled={floor.zones.length === 1}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button type="button" style={ap.secondaryBtn} onClick={() => addZone(floorIndex)}>
                        <Plus size={14} /> Add Zone
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          <Section icon={<FileText size={14} />} label="Property Image">
            <Field label="Upload Image">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                style={ap.input}
                onChange={(e) => set("image", e.target.files?.[0] ?? null)}
              />
            </Field>
          </Section>
        </div>
        <div style={ap.footer}>
          <button style={ap.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={ap.saveBtn} onClick={() => void handleSubmit()} disabled={saving}>
            {saving ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Add Property" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, fontWeight:700, color:"var(--c-text)", paddingBottom:8, marginBottom:14, borderBottom:"1px solid var(--c-divider)" }}>
        {icon}{label}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>{children}</div>
    </div>
  );
}
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:12.5, fontWeight:600, color:"var(--c-text-muted)" }}>{label}</label>
      {children}
      {error ? <div style={validationStyles.errorText}>{error}</div> : null}
    </div>
  );
}

function PropertyManagementSkeleton() {
  return (
    <div>
      <SkeletonTheme />
      <div style={pg.pageHeader}>
        <div>
          <SkeletonBlock width={220} height={28} />
          <SkeletonBlock width={320} height={12} style={{ marginTop: 10 }} />
        </div>
        <SkeletonBlock width={126} height={38} radius={10} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} style={sh.statMini}>
            <SkeletonBlock width="48%" height={12} />
            <SkeletonBlock width="36%" height={26} style={{ marginTop: 12 }} />
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} style={{ background: "var(--c-card)", border: "1px solid var(--c-card-border)", borderRadius: 12, padding: 18 }}>
            <SkeletonBlock width="42%" height={12} />
            <SkeletonBlock width="70%" height={20} style={{ marginTop: 12 }} />
            <SkeletonBlock width="88%" height={12} style={{ marginTop: 12 }} />
            <SkeletonBlock width="100%" height={72} radius={10} style={{ marginTop: 16 }} />
          </div>
        ))}
      </div>
      <SkeletonCardList count={3} />
    </div>
  );
}

// ─── Property list tab ────────────────────────────────────────────────────────
function PropertyCard({
  p,
  onEdit,
  onDelete,
}: {
  p: Property;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
}) {
  return (
    <div style={pl.card}>
      <div
        style={{
          height: 120,
          background: p.imageUrl
            ? `linear-gradient(rgba(15,23,42,0.2), rgba(15,23,42,0.55)), url(${p.imageUrl}) center/cover`
            : `linear-gradient(135deg, ${p.gradFrom}, ${p.gradTo})`,
          borderRadius: "10px 10px 0 0",
          position: "relative" as const,
          display: "flex",
          alignItems: "flex-end",
          padding: 10,
        }}
      >
        <Badge label={p.type.toUpperCase()} bg="rgba(0,0,0,0.45)" color="#fff" />
      </div>
      <div style={{ padding:"12px 14px 14px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:"var(--c-text)", marginBottom:3 }}>{p.name}</div>
        <div style={{ fontSize:12, color:"var(--c-text-faint)", marginBottom:10, display:"flex", alignItems:"center", gap:4 }}><MapPin size={11}/> {p.address}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:"var(--c-text-faint)", textTransform:"uppercase" as const, letterSpacing:"0.5px", marginBottom:3 }}>AMC STATUS</div>
            <Badge
              label={`● ${p.amcStatus.toUpperCase()}`}
              bg={p.amcStatus === "Active" ? "#f0fdf4" : "#fffbeb"}
              color={p.amcStatus === "Active" ? "#15803d" : "#b45309"}
              border={p.amcStatus === "Active" ? "#bbf7d0" : "#fde68a"}
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={pl.viewBtn} onClick={() => onEdit(p)}>
              <Pencil size={13} /> Edit
            </button>
            <button style={{ ...pl.viewBtn, color: "#dc2626" }} onClick={() => onDelete(p)}>
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyListTab({
  properties,
  summary,
  onAddProperty,
  onEditProperty,
  onDeleteProperty,
}: {
  properties: Property[];
  summary: PropertySummary | null;
  onAddProperty: () => void;
  onEditProperty: (property: Property) => void;
  onDeleteProperty: (property: Property) => void;
}) {
  return (
    <div>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        <StatMini label="TOTAL PROPERTIES" value={summary?.total ?? "—"} trend="+3 from last month" trendUp />
        <StatMini label="ACTIVE AMC" value={summary?.activeAmc ?? "—"} trend="60.5% COVERED" trendUp />
        <StatMini label="EXPIRING AMC" value={summary?.expiringAmc ?? "—"} trend="Renewals due in 30 days" trendUp={false} />
      </div>

      {/* Filters */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <div style={pl.searchBar}>
          <Search size={14} style={{ color:"var(--c-text-faint)" }}/>
          <input style={pl.searchInput} placeholder="Search by name, location or ID..."/>
        </div>
        <select style={pl.select}><option>All Status</option><option>Active</option><option>Expiring Soon</option></select>
        <select style={pl.select}><option>Property Type</option><option>Commercial</option><option>Residential</option><option>Industrial</option></select>
        <button style={pl.filterBtn}><Filter size={13}/> Advanced</button>
      </div>

      {/* Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
        {properties.map((p) => (
          <PropertyCard
            key={p.id}
            p={p}
            onEdit={onEditProperty}
            onDelete={onDeleteProperty}
          />
        ))}
        {/* Add placeholder */}
        <div
          style={{ border:"2px dashed var(--c-input-border)", borderRadius:12, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, gap:10, cursor:"pointer", background:"var(--c-card)" }}
          onClick={onAddProperty}
        >
          <div style={{ width:44, height:44, borderRadius:10, background:"var(--c-input-bg)", border:"1px solid var(--c-input-border)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Plus size={20} color="var(--c-text-faint)"/>
          </div>
          <div style={{ fontSize:14, fontWeight:700, color:"var(--c-text)" }}>Add New Asset</div>
          <div style={{ fontSize:12, color:"var(--c-text-faint)", textAlign:"center" as const }}>Start managing a new property and track its lifecycle</div>
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:13, color:"var(--c-text-muted)" }}>Showing 1 to {Math.min(5, properties.length)} of {properties.length} properties</span>
        <div style={{ display:"flex", gap:4 }}>
          {["←","1","2","3","...","9","→"].map(l=>(
            <button key={l} style={{ ...pl.pageBtn, ...(l==="1"?{background:"#0f172a",color:"#fff",borderColor:"#0f172a"}:{}) }}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Work Orders tab ──────────────────────────────────────────────────────────
function WorkOrdersTab({ workOrders }: { workOrders: WorkOrder[] }) {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, flex:1 }}>
          <StatMini label="Total Open" value={24} trend="+15%" trendUp/>
          <StatMini label="Due Today" value={5} trend="0%" trendUp/>
          <StatMini label="Emergency" value={2} trend="-1%" trendUp={false}/>
        </div>
      </div>
      {/* Filters */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <span style={wo.filterLabel}>STATUS:</span>
        <select style={wo.select}><option>All Statuses</option></select>
        <span style={wo.filterLabel}>PRIORITY:</span>
        <select style={wo.select}><option>All Priorities</option></select>
        <span style={wo.filterLabel}>DUE:</span>
        <select style={wo.select}><option>This Week</option></select>
        <button style={wo.createBtn}><Plus size={14}/> Create Work Order</button>
      </div>
      {/* Table */}
      <div style={{ background:"var(--c-card)", border:"1px solid var(--c-card-border)", borderRadius:12, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" as const }}>
          <thead>
            <tr>
              {["ID","DESCRIPTION","PRIORITY","STATUS","STAFF","DUE DATE","ACTION"].map(h=>(
                <th key={h} style={wo.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workOrders.map(w=>(
              <tr key={w.id} style={{ borderBottom:"1px solid var(--c-row-border)" }}>
                <td style={wo.td}><span style={{ fontSize:12, fontWeight:700, color:"#2563eb" }}>{w.id}</span></td>
                <td style={wo.td}>
                  <div style={{ fontSize:13.5, fontWeight:600, color:"var(--c-text)" }}>{w.description}</div>
                  <div style={{ fontSize:11.5, color:"var(--c-text-faint)" }}>{w.descSub}</div>
                </td>
                <td style={wo.td}>{priorityBadge(w.priority)}</td>
                <td style={wo.td}>{statusBadge(w.status)}</td>
                <td style={wo.td}>
                  {w.staff
                    ? <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <div style={{ width:26, height:26, borderRadius:"50%", background:"#6366f1", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10, fontWeight:700 }}>{w.staff.split(" ").map(x=>x[0]).join("")}</div>
                        <span style={{ fontSize:13, color:"var(--c-text-2)" }}>{w.staff}</span>
                      </div>
                    : <span style={{ fontSize:12.5, color:"var(--c-text-faint)" }}>Unassigned</span>}
                </td>
                <td style={{ ...wo.td, fontSize:13, color:"var(--c-text-muted)" }}>{w.dueDate}</td>
                <td style={wo.td}>
                  <button style={wo.actionLink}>{woAction(w.status)}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 18px", borderTop:"1px solid var(--c-row-border)" }}>
          <span style={{ fontSize:13, color:"var(--c-text-muted)" }}>Showing 1 to 5 of 24 results</span>
          <div style={{ display:"flex", gap:4 }}>
            {["‹","1","2","3","›"].map(l=>(
              <button key={l} style={{ ...pl.pageBtn, ...(l==="1"?{background:"#0f172a",color:"#fff",borderColor:"#0f172a"}:{}) }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Asset Tracking tab ───────────────────────────────────────────────────────
function AssetTrackingTab({
  assets,
  summary,
}: {
  assets: Asset[];
  summary: AssetSummary | null;
}) {
  const [view, setView] = useState<"list"|"map">("list");
  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:"var(--c-text)" }}>Asset Management</h2>
          <p style={{ margin:"3px 0 0", fontSize:13, color:"var(--c-text-muted)" }}>Monitor, track, and schedule maintenance for critical facility infrastructure.</p>
        </div>
        <div style={{ display:"flex", gap:0, border:"1px solid var(--c-input-border)", borderRadius:8, overflow:"hidden" }}>
          {([["list","List View",LayoutGrid],["map","Map View",Map]] as const).map(([id,label,Icon])=>(
            <button key={id} onClick={()=>setView(id)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", fontSize:13, fontWeight:500, border:"none", cursor:"pointer", background: view===id?"#0f172a":"var(--c-card)", color:view===id?"#fff":"var(--c-text-muted)" }}>
              <Icon size={14}/>{label}
            </button>
          ))}
          <button style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", fontSize:13, fontWeight:500, border:"none", borderLeft:"1px solid var(--c-input-border)", cursor:"pointer", background:"var(--c-card)", color:"var(--c-text-muted)" }}>
            <Filter size={14}/> Filters
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:18 }}>
        <StatMini label="TOTAL ASSETS" value={summary?.total ?? "—"} trend="+5 this week" trendUp/>
        <StatMini label="NEEDS ATTENTION" value={summary?.needsAttention ?? "—"} trend="-2 resolved" trendUp={false}/>
        <StatMini label="UPCOMING SERVICE" value={summary?.upcomingService ?? "—"} />
        <StatMini label="UPTIME RATE" value={summary?.uptimeRate != null ? `${summary.uptimeRate}%` : "—"} trend="+0.2%" trendUp/>
      </div>

      {/* Search & filters */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        <div style={{ ...pl.searchBar, flex:1, maxWidth:320 }}>
          <Search size={14} style={{ color:"var(--c-text-faint)" }}/>
          <input style={pl.searchInput} placeholder="Search HVAC, Elevator, ID..."/>
        </div>
        <select style={pl.select}><option>All Types</option><option>HVAC</option><option>Elevator</option><option>Generator</option></select>
        <select style={pl.select}><option>Sort by: Newest</option><option>Sort by: Condition</option></select>
      </div>

      {/* Table */}
      <div style={{ background:"var(--c-card)", border:"1px solid var(--c-card-border)", borderRadius:12, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" as const }}>
          <thead>
            <tr>
              {["ASSET NAME","LOCATION","CONDITION","LAST MAINT.","NEXT SERVICE"].map(h=>(
                <th key={h} style={wo.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map(a=>(
              <tr key={a.id} style={{ borderBottom:"1px solid var(--c-row-border)" }}>
                <td style={wo.td}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:"var(--c-input-bg)", border:"1px solid var(--c-card-border)", display:"flex", alignItems:"center", justifyContent:"center" }}><AssetIcon icon={a.icon}/></div>
                    <div>
                      <div style={{ fontSize:13.5, fontWeight:600, color:"var(--c-text)" }}>{a.name}</div>
                      <div style={{ fontSize:11.5, color:"var(--c-text-faint)" }}>ID: FACI-{String(1000+a.id).padStart(4,"0")}</div>
                    </div>
                  </div>
                </td>
                <td style={{ ...wo.td, fontSize:13, color:"var(--c-text-2)" }}>{a.location}</td>
                <td style={wo.td}>{conditionBadge(a.condition)}</td>
                <td style={{ ...wo.td, fontSize:13, color:"var(--c-text-muted)" }}>{a.lastMaint}</td>
                <td style={wo.td}>
                  <span style={{ fontSize:13, fontWeight:600, color: a.overdue ? "#dc2626" : "var(--c-text-2)" }}>{a.nextService}</span>
                  {a.overdue && <div style={{ fontSize:10.5, color:"#dc2626", fontWeight:600 }}>OVERDUE</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 18px", borderTop:"1px solid var(--c-row-border)" }}>
          <span style={{ fontSize:13, color:"var(--c-text-muted)" }}>Showing 1 to 4 of 160 assets</span>
          <div style={{ display:"flex", gap:4 }}>
            {["Previous","1","2","3","Next"].map(l=>(
              <button key={l} style={{ ...pl.pageBtn, ...(l==="1"?{background:"#0f172a",color:"#fff",borderColor:"#0f172a"}:{}) }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reports tab ──────────────────────────────────────────────────────────────
function ReportsTab({ reports }: { reports: typeof REPORTS }) {
  const [tab, setTab] = useState<ReportTab>("overview");
  const RTABS: { id: ReportTab; label: string }[] = [
    { id:"overview", label:"Overview" }, { id:"financial", label:"Financial" },
    { id:"operational", label:"Operational" }, { id:"sustainability", label:"Sustainability" },
  ];
  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:"var(--c-text)" }}>Analytics &amp; Reports</h2>
          <p style={{ margin:"3px 0 0", fontSize:13, color:"#2563eb" }}>Monitor facility performance, maintenance trends, and energy efficiency</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ ...pl.select, padding:"7px 14px", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6 }}><BarChart2 size={13}/> Last 30 Days ▾</button>
          <button style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 16px", fontSize:13, fontWeight:600, border:"1px solid var(--c-input-border)", borderRadius:8, background:"var(--c-card)", color:"var(--c-text-2)", cursor:"pointer" }}>
            <Download size={14}/> Export All
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:"1px solid var(--c-divider)", marginBottom:20 }}>
        {RTABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"9px 16px", fontSize:13.5, fontWeight: tab===t.id?700:500, border:"none", background:"none", cursor:"pointer", color: tab===t.id?"#2563eb":"var(--c-text-muted)", borderBottom: tab===t.id?"2px solid #2563eb":"2px solid transparent", marginBottom:-1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Metric cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"TOTAL SPEND", value:"$42,500", trend:"-5.2% vs last month", up:false, icon:<TrendingDown size={16} color="#dc2626"/> },
          { label:"TASK COMPLETION", value:"94.2%", trend:"+2.8% vs last month", up:true, icon:<CheckCircle2 size={16} color="#2563eb"/> },
          { label:"ENERGY USAGE", value:"4.2k kWh", trend:"-2.1% efficiency drop", up:false, icon:<Zap size={16} color="#ea580c"/> },
        ].map(m=>(
          <div key={m.label} style={{ background:"var(--c-card)", border:"1px solid var(--c-card-border)", borderRadius:12, padding:"16px 18px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:11, fontWeight:700, color:"var(--c-text-faint)", textTransform:"uppercase" as const, letterSpacing:"0.5px" }}>{m.label}</span>
              {m.icon}
            </div>
            <div style={{ fontSize:24, fontWeight:800, color:"var(--c-text)", marginBottom:4 }}>{m.value}</div>
            <div style={{ fontSize:12, fontWeight:600, color: m.up?"#16a34a":"#dc2626" }}>{m.trend}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        {[
          { title:"Costs vs Budget",     pct:68, color:"#2563eb", label:"4.2k\nTOTAL KWH", legend:["Actual","Budget"] },
          { title:"Task Trends",         pct:82, color:"#ea580c", label:"4.2k\nTOTAL KWH", legend:["WK 1","WK 2","WK 3","WK 4"] },
          { title:"Energy by Property",  pct:56, color:"#7c3aed", label:"4.2k\nTOTAL KWH", legend:["North Wing","South Hub","West Plaza","Other"] },
        ].map(c=>(
          <div key={c.title} style={{ background:"var(--c-card)", border:"1px solid var(--c-card-border)", borderRadius:12, padding:"16px 18px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ fontSize:13.5, fontWeight:700, color:"var(--c-text)" }}>{c.title}</span>
              <span style={{ color:"var(--c-text-faint)", cursor:"pointer" }}>···</span>
            </div>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
              <DonutChart pct={c.pct} color={c.color} label="4.2k" />
            </div>
            <div style={{ display:"flex", flexWrap:"wrap" as const, gap:"4px 12px", justifyContent:"center" }}>
              {c.legend.map((l,i)=>(
                <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11.5, color:"var(--c-text-muted)" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:["#2563eb","#7c3aed","#ea580c","#94a3b8"][i%4] }}/>
                  {l}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent reports */}
      <div style={{ background:"var(--c-card)", border:"1px solid var(--c-card-border)", borderRadius:12, overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderBottom:"1px solid var(--c-divider)" }}>
          <span style={{ fontSize:14, fontWeight:700, color:"var(--c-text)" }}>Recent Reports</span>
          <div style={{ display:"flex", gap:8 }}>
            <button style={{ ...wo.actionLink, border:"1px solid var(--c-input-border)", padding:"5px 8px", borderRadius:7 }}><Filter size={14}/></button>
            <button style={{ ...wo.actionLink, border:"1px solid var(--c-input-border)", padding:"5px 8px", borderRadius:7 }}><Search size={14}/></button>
          </div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" as const }}>
          <thead>
            <tr>
              {["REPORT NAME","CATEGORY","GENERATED DATE","ACTION"].map(h=>(
                <th key={h} style={wo.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.map(r=>(
              <tr key={r.id} style={{ borderBottom:"1px solid var(--c-row-border)" }}>
                <td style={wo.td}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:28, height:28, borderRadius:7, background:"var(--c-input-bg)", border:"1px solid var(--c-card-border)", display:"flex", alignItems:"center", justifyContent:"center" }}><ReportIcon icon={r.icon}/></div>
                    <span style={{ fontSize:13.5, fontWeight:600, color:"var(--c-text)" }}>{r.name}</span>
                  </div>
                </td>
                <td style={wo.td}><Badge label={r.category} bg={r.catBg} color={r.catColor}/></td>
                <td style={{ ...wo.td, fontSize:13, color:"var(--c-text-muted)" }}>{r.date}</td>
                <td style={wo.td}>
                  <button style={{ ...wo.actionLink, border:"1px solid var(--c-input-border)", padding:"5px 8px", borderRadius:7 }}><Download size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign:"center" as const, padding:"14px", borderTop:"1px solid var(--c-divider)" }}>
          <button style={{ fontSize:13.5, fontWeight:600, color:"#2563eb", background:"none", border:"none", cursor:"pointer" }}>View All Historical Reports</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
const TAB_DEFS: { id: MainTab; label: string; icon: React.ElementType }[] = [
  { id:"list",       label:"Properties",     icon: Building2 },
  { id:"workorders", label:"Work Orders",    icon: Wrench },
  { id:"assets",     label:"Asset Tracking", icon: BarChart2 },
  { id:"reports",    label:"Reports",        icon: BookOpen },
];

export function PropertyManagementPage() {
  const [tab, setTab] = useState<MainTab>("list");
  const [showAddProp, setShowAddProp] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const { showToast } = useToast();

  const [properties, setProperties] = useState<Property[]>(PROPERTIES);
  const [propertySummary, setPropertySummary] = useState<PropertySummary | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(WORK_ORDERS);
  const [assets, setAssets] = useState<Asset[]>(ASSETS);
  const [assetSummary, setAssetSummary] = useState<AssetSummary | null>(null);
  const [reports, setReports] = useState(REPORTS);
  const [loading, setLoading] = useState(true);

  useShellHeader({ showSearch: true });

  function normalizeProperty(p: Record<string, unknown>, idx: number): Property {
    const type = String(p.propertyType ?? p.category ?? "Commercial");
    const amc = String(p.amcStatus ?? "Active");
    const mapType: PropertyType =
      type.toLowerCase().includes("res") ? "Residential" :
      type.toLowerCase().includes("ind") ? "Industrial" : "Commercial";
    const mapAmc: AMCStatus =
      amc.toLowerCase().includes("expire") && amc.toLowerCase().includes("soon") ? "Expiring Soon" :
      amc.toLowerCase().includes("expire") ? "Expired" : "Active";

    return {
      id: idx + 1,
      apiId: String(p.id ?? idx + 1),
      name: String(p.propertyName ?? p.name ?? "—"),
      address: String(p.location ?? [p.city, p.stateProvince].filter(Boolean).join(", ") ?? "—"),
      type: mapType,
      amcStatus: mapAmc,
      gradFrom: "#1e3a5f",
      gradTo: "#2563eb",
      imageUrl: p.imageUrl == null ? null : String(p.imageUrl),
      createdAt: p.createdAt == null ? undefined : String(p.createdAt),
      updatedAt: p.updatedAt == null ? undefined : String(p.updatedAt),
    };
  }

  async function handleCreateProperty(form: PropertyFormState) {
    const floors = form.floors
      .map((floor) => ({
        floorNumber: Number(floor.floorNumber),
        zones: floor.zones
          .map((zone) => ({ name: zone.name.trim() }))
          .filter((zone) => zone.name),
      }))
      .filter((floor) => Number.isFinite(floor.floorNumber) && floor.zones.length > 0);
    const payload = new FormData();
    payload.append("propertyName", form.propertyName.trim());
    if (floors.length) payload.append("floors", JSON.stringify(floors));
    if (form.image) payload.append("image", form.image);
    await createProperty(payload);
    showToast("success", "Property Added", `"${form.propertyName}" has been created.`);
    await refreshAll();
  }

  async function handleUpdateProperty(form: PropertyFormState) {
    if (!editingProperty?.apiId) return;
    if (form.image) {
      const payload = new FormData();
      payload.append("name", form.propertyName.trim());
      payload.append("image", form.image);
      await updateProperty(editingProperty.apiId, payload);
    } else {
      await updateProperty(editingProperty.apiId, { name: form.propertyName.trim() });
    }
    showToast("success", "Property Updated", `"${form.propertyName}" has been updated.`);
    setEditingProperty(null);
    await refreshAll();
  }

  async function handleDeleteProperty(property: Property) {
    if (!property.apiId) return;
    try {
      await deleteProperty(property.apiId);
      showToast("success", "Property Deleted", `"${property.name}" has been removed.`);
      await refreshAll();
    } catch (e) {
      showToast("error", "Failed to delete property", e instanceof Error ? e.message : "Please try again.");
    }
  }

  function normalizeWorkOrderFromTask(t: Record<string, unknown>, idx: number): WorkOrder {
    const title = String(t.title ?? t.taskName ?? "Work Order");
    const status = String(t.status ?? "New").toUpperCase().replace(/\\s/g, "_");
    const priority = String(t.priority ?? "Medium").toLowerCase();
    const pMap: WOPriority =
      priority.includes("urgent") ? "Emergency" :
      priority.includes("high") ? "High" :
      priority.includes("low") ? "Low" : "Medium";
    const sMap: WOStatus =
      status.includes("IN_PROGRESS") ? "In Progress" :
      status.includes("COMPLETED") ? "Completed" :
      status.includes("ON_HOLD") ? "On Hold" :
      status.includes("ASSIGNED") ? "Assigned" : "New";
    const assignee =
      (t.assignee as { name?: string } | undefined)?.name ??
      (t.assigneeName as string | undefined) ??
      null;
    return {
      id: String(t._id ?? t.id ?? `WO-${idx + 1}`),
      description: title,
      descSub: String(t.description ?? "—"),
      priority: pMap,
      status: sMap,
      staff: assignee,
      dueDate: String(t.dueDate ?? "—"),
    };
  }

  function normalizeAsset(a: Record<string, unknown>, idx: number): Asset {
    const condition = String(a.condition ?? a.status ?? "Good").toLowerCase();
    const cMap: AssetCondition =
      condition.includes("excellent") ? "Excellent" :
      condition.includes("fair") ? "Fair" :
      condition.includes("poor") ? "Poor" : "Good";
    return {
      id: idx + 1,
      name: String(a.name ?? a.assetName ?? "—"),
      icon: "wrench",
      location: String(a.location ?? a.zone ?? "—"),
      condition: cMap,
      lastMaint: String(a.lastMaint ?? a.lastMaintenance ?? "—"),
      nextService: String(a.nextService ?? a.nextMaintenance ?? "—"),
      overdue: Boolean(a.nextServiceUrgent ?? a.overdue),
    };
  }

  function normalizeReport(r: Record<string, unknown>, idx: number) {
    const cat = String(r.category ?? "Operational");
    const catLower = cat.toLowerCase();
    const palette =
      catLower.includes("fin")
        ? { catColor: "#1d4ed8", catBg: "#eff6ff", icon: "file" }
        : catLower.includes("sus")
          ? { catColor: "#15803d", catBg: "#f0fdf4", icon: "zap" }
          : { catColor: "#475569", catBg: "#f8fafc", icon: "settings" };
    return {
      id: idx + 1,
      name: String(r.name ?? r.title ?? "Report"),
      icon: palette.icon,
      category: cat,
      catColor: palette.catColor,
      catBg: palette.catBg,
      date: String(r.generatedDate ?? r.createdAt ?? "—"),
    };
  }

  async function refreshAll() {
    try {
      setLoading(true);
      const [propsRaw, propSum, taskRaw, assetsRaw, assetSum, reportsRaw] = await Promise.all([
        getProperties(),
        getPropertySummary().catch(() => null),
        getTasks().catch(() => []),
        getAssets({}).catch(() => ({ list: [] })),
        getAssetSummary().catch(() => null),
        getReports({}).catch(() => ({ list: [] })),
      ]);

      if (Array.isArray(propsRaw) && propsRaw.length) {
        setProperties(
          propsRaw.map((p, idx) =>
            normalizeProperty(p as unknown as Record<string, unknown>, idx),
          ),
        );
      }

      if (Array.isArray(propSum)) {
        const d = propSum as Array<{
          floorCount?: number;
          zoneCount?: number;
          departmentCount?: number;
        }>;
        setPropertySummary({
          total: d.length,
          activeAmc: d.length,
          expiringAmc: 0,
        });
      }

      if (Array.isArray(taskRaw) && taskRaw.length) {
        setWorkOrders(taskRaw.map((t, idx) => normalizeWorkOrderFromTask(t as Record<string, unknown>, idx)));
      }

      const aList =
        (assetsRaw as { data?: unknown; list?: unknown[]; total?: unknown }).data ??
        (assetsRaw as { list?: unknown[] }).list ??
        [];
      if (Array.isArray(aList) && aList.length) {
        setAssets(aList.map((a, idx) => normalizeAsset(a as Record<string, unknown>, idx)));
      }

      if (assetSum && typeof assetSum === "object") {
        const d = (assetSum as { data?: Record<string, unknown> }).data ?? (assetSum as Record<string, unknown>);
        setAssetSummary({
          total: Number(d.total ?? 0) || 0,
          needsAttention: Number(d.needsAttention ?? d.needs_attention ?? 0) || 0,
          upcomingService: Number(d.upcomingService ?? d.upcoming_service ?? 0) || 0,
          uptimeRate: Number(d.uptimeRate ?? d.uptime_rate ?? 0) || 0,
        });
      }

      const rList =
        (reportsRaw as { data?: unknown; list?: unknown[] }).data ??
        (reportsRaw as { list?: unknown[] }).list ??
        [];
      if (Array.isArray(rList) && rList.length) {
        setReports(rList.map((r, idx) => normalizeReport(r as Record<string, unknown>, idx)));
      }
    } catch (e) {
      showToast("error", "Failed to sync properties data", e instanceof Error ? e.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <PropertyManagementSkeleton />;
  }

  return (
    <div>
      {/* Content-level header */}
      <div style={pg.pageHeader}>
        <div>
          <h1 style={pg.pageTitle}>Property Management</h1>
          <p style={pg.pageSub}>Manage and track your portfolio assets across all locations.</p>
        </div>
        <button style={pg.addBtn} onClick={() => setShowAddProp(true)}>
          <Plus size={15}/> Add Property
        </button>
      </div>

      {/* Tab nav */}
      <div style={{ display:"flex", gap:10, marginBottom:24 }}>
        {TAB_DEFS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ ...pg.tabBtn, ...(tab === t.id ? pg.tabBtnActive : {}) }}>
              <Icon size={14}/> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "list" && (
        <PropertyListTab
          properties={properties}
          summary={propertySummary}
          onAddProperty={() => setShowAddProp(true)}
          onEditProperty={(property) => setEditingProperty(property)}
          onDeleteProperty={(property) => void handleDeleteProperty(property)}
        />
      )}
      {tab === "workorders" && <WorkOrdersTab workOrders={workOrders} />}
      {tab === "assets" && <AssetTrackingTab assets={assets} summary={assetSummary} />}
      {tab === "reports" && <ReportsTab reports={reports} />}

      {/* Modals */}
      {showAddProp && (
        <PropertyModal
          mode="create"
          onClose={() => setShowAddProp(false)}
          onSubmit={handleCreateProperty}
        />
      )}
      {editingProperty && (
        <PropertyModal
          mode="edit"
          initial={{
            propertyName: editingProperty.name,
            image: null,
          }}
          onClose={() => setEditingProperty(null)}
          onSubmit={handleUpdateProperty}
        />
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const pg: Record<string, React.CSSProperties> = {
  pageHeader: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, marginBottom:20, flexWrap:"wrap" },
  pageTitle:  { margin:0, fontSize:22, fontWeight:800, color:"var(--c-text)", letterSpacing:"-0.3px" },
  pageSub:    { margin:"4px 0 0", fontSize:13, color:"var(--c-text-muted)" },
  addBtn:     { display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", fontSize:13.5, fontWeight:600, border:"none", borderRadius:8, background:"#2563eb", color:"#fff", cursor:"pointer" },
  tabBtn:     { display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px", fontSize:13.5, fontWeight:500, border:"1px solid var(--c-input-border)", borderRadius:9, background:"var(--c-card)", color:"var(--c-text-muted)", cursor:"pointer" },
  tabBtnActive: { background:"#2563eb", color:"#ffffff", borderColor:"#2563eb" },
};
const pl: Record<string, React.CSSProperties> = {
  searchBar: { display:"flex", alignItems:"center", gap:8, background:"var(--c-card)", border:"1px solid var(--c-input-border)", borderRadius:8, padding:"7px 12px", minWidth:240 },
  searchInput: { border:"none", background:"none", outline:"none", fontSize:13.5, color:"var(--c-text)", width:"100%" },
  select: { padding:"7px 10px", fontSize:13, border:"1px solid var(--c-input-border)", borderRadius:8, outline:"none", color:"var(--c-text-2)", background:"var(--c-card)", cursor:"pointer" },
  filterBtn: { display:"inline-flex", alignItems:"center", gap:6, padding:"7px 12px", fontSize:13, border:"1px solid var(--c-input-border)", borderRadius:8, background:"var(--c-card)", color:"var(--c-text-2)", cursor:"pointer" },
  card: { background:"var(--c-card)", border:"1px solid var(--c-card-border)", borderRadius:12, overflow:"hidden" },
  viewBtn: { fontSize:12.5, fontWeight:600, color:"#2563eb", background:"none", border:"none", cursor:"pointer", padding:0 },
  pageBtn: { minWidth:32, height:30, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 8px", fontSize:13, border:"1px solid var(--c-input-border)", borderRadius:6, background:"var(--c-card)", cursor:"pointer", color:"var(--c-text-muted)" },
};
const sh: Record<string, React.CSSProperties> = {
  statMini: { background:"var(--c-card)", border:"1px solid var(--c-card-border)", borderRadius:12, padding:"14px 16px" },
  statMiniLabel: { fontSize:10.5, fontWeight:700, color:"var(--c-text-faint)", textTransform:"uppercase" as const, letterSpacing:"0.6px", marginBottom:6 },
  statMiniValue: { fontSize:24, fontWeight:800, color:"var(--c-text)", letterSpacing:"-0.5px" },
};
const wo: Record<string, React.CSSProperties> = {
  filterLabel: { fontSize:11.5, fontWeight:700, color:"var(--c-text-faint)", textTransform:"uppercase" as const, letterSpacing:"0.5px" },
  select: { padding:"7px 10px", fontSize:13, border:"1px solid var(--c-input-border)", borderRadius:8, outline:"none", color:"var(--c-text-2)", background:"var(--c-card)", cursor:"pointer" },
  createBtn: { display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", fontSize:13, fontWeight:600, border:"none", borderRadius:8, background:"#2563eb", color:"#fff", cursor:"pointer", marginLeft:"auto" as unknown as undefined },
  th: { padding:"10px 16px", textAlign:"left" as const, fontSize:11, fontWeight:700, color:"var(--c-text-faint)", letterSpacing:"0.6px", textTransform:"uppercase" as const, background:"var(--c-table-head)", borderBottom:"1px solid var(--c-row-border)" },
  td: { padding:"12px 16px", verticalAlign:"middle" as const },
  actionLink: { fontSize:13, fontWeight:600, color:"#2563eb", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:5 },
};
const ap: Record<string, React.CSSProperties> = {
  overlay: { position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:24 },
  panel: { width:"100%", maxWidth:620, maxHeight:"92vh", background:"var(--c-card)", border:"1px solid var(--c-card-border)", borderRadius:16, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 64px rgba(0,0,0,0.3)" },
  header: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"22px 24px 14px", borderBottom:"1px solid var(--c-divider)", gap:12 },
  title: { margin:0, fontSize:18, fontWeight:800, color:"var(--c-text)" },
  sub: { margin:"4px 0 0", fontSize:12.5, color:"var(--c-text-muted)" },
  closeBtn: { width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid var(--c-input-border)", borderRadius:8, background:"var(--c-card)", color:"var(--c-text-muted)", cursor:"pointer", flexShrink:0 },
  body: { flex:1, overflowY:"auto" as const, padding:"20px 24px" },
  row2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  row3: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 },
  input: { padding:"9px 12px", fontSize:13.5, border:"1px solid var(--c-input-border)", borderRadius:8, outline:"none", color:"var(--c-text)", background:"var(--c-input-bg)", width:"100%", boxSizing:"border-box" as const },
  secondaryBtn: { display:"inline-flex", alignItems:"center", gap:6, padding:"8px 12px", fontSize:12.5, fontWeight:700, border:"1px solid var(--c-input-border)", borderRadius:8, background:"var(--c-card)", color:"var(--c-text-2)", cursor:"pointer" },
  floorCard: { padding:"14px", border:"1px solid var(--c-card-border)", borderRadius:12, background:"var(--c-card)" },
  floorHeader: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:12 },
  zoneRow: { display:"grid", gridTemplateColumns:"1fr auto", gap:10, alignItems:"start" },
  footer: { display:"flex", justifyContent:"flex-end", gap:10, padding:"14px 24px", borderTop:"1px solid var(--c-divider)" },
  cancelBtn: { padding:"9px 20px", fontSize:13.5, fontWeight:600, border:"1px solid var(--c-input-border)", borderRadius:8, background:"var(--c-card)", color:"var(--c-text-2)", cursor:"pointer" },
  saveBtn: { padding:"9px 22px", fontSize:13.5, fontWeight:600, border:"none", borderRadius:8, background:"#2563eb", color:"#fff", cursor:"pointer" },
};
