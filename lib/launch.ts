export type LaunchLog = {
  id: string;
  date: string;
  revisionId: string;
  revisionName: string;
  motor: string;
  weather: string;
  maxAlt_m?: number;
  flightTime_s?: number;
  note?: string;
};

const KEY = "rocket_launch_logs_v1";

export function loadLaunchLogs(): LaunchLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLaunchLogs(logs: LaunchLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(logs));
}
