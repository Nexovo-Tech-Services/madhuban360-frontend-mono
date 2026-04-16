import { getAuthHeaders, readJsonOrThrow, unwrapApiData } from "./client";
import { getApiBaseUrl } from "./env";

const API = () => `${getApiBaseUrl()}/api`;

function withOptionalDate(path: string, date?: string): string {
  if (!date) return path;
  const params = new URLSearchParams({ date });
  return `${path}?${params.toString()}`;
}

function withQuery(
  path: string,
  params: Record<string, string | number | undefined | null>,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}

export interface ManagerDashboardResponse {
  profile: {
    name: string;
    initials: string;
    role: string;
  };
  context: {
    label: string;
    shift: string;
    shiftLabel: string;
  };
  stats: {
    needsReview: number;
    approved: number;
    rejected: number;
  };
  completion: {
    percent: number;
    done: number;
    pending: number;
    total: number;
  };
  urgentTasks: Array<{
    dailyTaskId: number;
    taskTitle: string;
    assigneeName: string;
    assigneeInitials: string;
    urgencyKind: string;
    label: string;
    deadlineAt: string;
  }>;
  zones: Array<{
    zoneId: number;
    zoneName: string;
    propertyName: string;
    floorNo: number;
    assigned: number;
    done: number;
    percent: number;
    healthBand: string;
  }>;
  recentActivity: Array<{
    id: number;
    action: string;
    decidedAt: string;
    timeDisplay: string;
    taskTitle: string;
    staffName: string;
    note: string | null;
  }>;
  badges: {
    tasksPending: number;
    notificationsUnread: number;
  };
  date: string;
  shiftInProgress: boolean;
}

export interface ManagerProfileResponse {
  profile: {
    manager_id: number;
    full_name: string;
    email: string;
    initials: string;
    role: string;
  };
  badges: {
    shift: string;
    status: string;
  };
  account: {
    propertyLabel: string;
    reportingTo: string | null;
    appVersion: string;
  };
}

export interface ManagerAttendanceResponse {
  workDate: string;
  status: string | null;
  phase: "NOT_CHECKED_IN" | "ACTIVE" | "COMPLETED";
  checkInAt: string | null;
  checkOutAt: string | null;
  selfieUrl: string | null;
  checkInLatitude: number | null;
  checkInLongitude: number | null;
  checkOutLatitude: number | null;
  checkOutLongitude: number | null;
  shift: string | null;
}

export interface ManagerAttendanceSubmitPayload {
  action: "check_in" | "check_out";
  latitude: string | number;
  longitude: string | number;
  selfie?: {
    uri: string;
    type?: string;
    name?: string;
  };
}

export interface ManagerTasksResponse {
  date: string;
  supervisorId: number | null;
  supervisorIds: number[];
  filter: string;
  status: string;
  counts: {
    all: number;
    critical: number;
    high: number;
    done: number;
  };
  progress: {
    done: number;
    total: number;
    percent: number;
  };
  tasks: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ManagerSupervisorRecord {
  id: number;
  name: string;
  email: string;
  staffCount: number;
}

export interface ManagerTaskFilters {
  supervisorId?: number | string;
  date?: string;
  filter?: string;
  status?: "pending" | "in_review" | "approved" | "rejected";
  page?: number;
  limit?: number;
}

export interface ManagerReviewDecisionPayload {
  action: "approve" | "reject";
  comment?: string;
}

export interface ManagerReviewDecisionResponse {
  message?: string;
  data?: {
    currentStatus?: string;
  };
}

export interface ManagerShiftReportResponse {
  date: string;
  overview: {
    completion: {
      percent: number;
      done: number;
      pending: number;
      total: number;
    };
    approvals: {
      approved: number;
      pending: number;
      rejected: number;
    };
  };
  zones: Array<{
    zoneId: number;
    zoneName: string;
    propertyName: string;
    floorNo: number;
    assigned: number;
    done: number;
    percent: number;
  }>;
  functions: Array<{
    functionKey: string;
    functionLabel: string;
    assigned: number;
    approved: number;
    percent: number;
  }>;
  employees: Array<{
    staffId: number;
    name: string;
    initials: string;
    scorePercent: number;
    tasks: number;
    onTimePercent: number;
  }>;
  escalations: Array<{
    kind: string;
    staffId?: number;
    staffName?: string;
    dailyTaskId?: number;
    title?: string;
    zoneName?: string;
    label: string;
    time?: string | null;
    deadlineAt?: string;
  }>;
}

export interface ManagerEmployeeShiftReportResponse {
  staffId: number;
  staffName: string;
  staffInitials: string;
  summary: {
    staffId: number;
    name: string;
    initials: string;
    scorePercent: number;
    tasks: number;
    onTimePercent: number;
  } | null;
  logs: Array<{
    dailyTaskId: number;
    title: string;
    zoneName: string;
    propertyName: string;
    floorNo: number;
    status: string;
    time: string | null;
    rating: number | null;
  }>;
}

export async function getManagerDashboard(date?: string): Promise<ManagerDashboardResponse> {
  const res = await fetch(withOptionalDate(`${API()}/manager/dashboard`, date), {
    headers: getAuthHeaders(),
  });
  return unwrapApiData<ManagerDashboardResponse>(await readJsonOrThrow(res));
}

export async function getManagerProfile(): Promise<ManagerProfileResponse> {
  const res = await fetch(`${API()}/manager/profile`, {
    headers: getAuthHeaders(),
  });
  return unwrapApiData<ManagerProfileResponse>(await readJsonOrThrow(res));
}

async function appendManagerUploadableFile(
  formData: FormData,
  fieldName: string,
  file: NonNullable<ManagerAttendanceSubmitPayload["selfie"]>,
): Promise<void> {
  const isReactNativeRuntime =
    typeof navigator !== "undefined" && navigator.product === "ReactNative";
  const hasUriScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(file.uri);
  const normalizedUri = hasUriScheme ? file.uri : `file://${file.uri}`;
  if (!isReactNativeRuntime) {
    const response = await fetch(normalizedUri);
    if (!response.ok) {
      throw new Error(`Unable to read ${fieldName} file.`);
    }
    const blob = await response.blob();
    const typedBlob =
      blob.type || !file.type ? blob : blob.slice(0, blob.size, file.type || "image/jpeg");
    (
      formData as unknown as {
        append(name: string, value: Blob, fileName?: string): void;
      }
    ).append(fieldName, typedBlob, file.name || `${fieldName}-${Date.now()}.jpg`);
    return;
  }
  (
    formData as unknown as {
      append(
        name: string,
        value: { uri: string; type: string; name: string },
      ): void;
    }
  ).append(fieldName, {
    uri: normalizedUri,
    type: file.type || "image/jpeg",
    name: file.name || `${fieldName}-${Date.now()}.jpg`,
  });
}

export async function getManagerAttendance(
  date?: string,
): Promise<ManagerAttendanceResponse> {
  const res = await fetch(withOptionalDate(`${API()}/manager/attendance`, date), {
    headers: getAuthHeaders(),
  });
  return unwrapApiData<ManagerAttendanceResponse>(await readJsonOrThrow(res));
}

export async function submitManagerAttendance(
  payload: ManagerAttendanceSubmitPayload,
): Promise<ManagerAttendanceResponse> {
  const formData = new FormData();
  formData.append("action", payload.action);
  formData.append("latitude", String(payload.latitude));
  formData.append("longitude", String(payload.longitude));
  if (payload.selfie) {
    await appendManagerUploadableFile(formData, "selfie", payload.selfie);
  }
  const headers = getAuthHeaders();
  delete headers["Content-Type"];
  const res = await fetch(`${API()}/manager/attendance`, {
    method: "POST",
    headers,
    body: formData,
  });
  return unwrapApiData<ManagerAttendanceResponse>(await readJsonOrThrow(res));
}

export async function getManagerTasks(
  filters: ManagerTaskFilters = {},
): Promise<ManagerTasksResponse> {
  const res = await fetch(
    withQuery(`${API()}/manager/tasks`, {
      supervisorId: filters.supervisorId,
      date: filters.date,
      filter: filters.filter,
      status: filters.status,
      page: filters.page,
      limit: filters.limit,
    }),
    { headers: getAuthHeaders() },
  );
  return unwrapApiData<ManagerTasksResponse>(await readJsonOrThrow(res));
}

export async function getManagerSupervisors(): Promise<ManagerSupervisorRecord[]> {
  const res = await fetch(`${API()}/manager/supervisors`, {
    headers: getAuthHeaders(),
  });
  return unwrapApiData<ManagerSupervisorRecord[]>(await readJsonOrThrow(res));
}

export async function getManagerShiftReport(
  date?: string,
): Promise<ManagerShiftReportResponse> {
  const res = await fetch(withOptionalDate(`${API()}/manager/reports/shift`, date), {
    headers: getAuthHeaders(),
  });
  return unwrapApiData<ManagerShiftReportResponse>(await readJsonOrThrow(res));
}

export async function getManagerEmployeeShiftReport(
  staffId: number | string,
  date?: string,
): Promise<ManagerEmployeeShiftReportResponse> {
  const res = await fetch(
    withOptionalDate(`${API()}/manager/reports/shift/employees/${staffId}`, date),
    { headers: getAuthHeaders() },
  );
  return unwrapApiData<ManagerEmployeeShiftReportResponse>(await readJsonOrThrow(res));
}

export async function submitManagerReviewDecision(
  dailyTaskId: number | string,
  payload: ManagerReviewDecisionPayload,
): Promise<ManagerReviewDecisionResponse> {
  const res = await fetch(`${API()}/manager/reviews/${dailyTaskId}/decision`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return (await readJsonOrThrow(res)) as ManagerReviewDecisionResponse;
}
