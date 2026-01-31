import { Part } from "./types";

export type Geom = {
  body_d_cm: number;
  body_l_cm: number;
  nose_l_cm: number;
  fin_n: number;
  fin_root_cm: number;
  fin_tip_cm: number;
  fin_span_cm: number;
  fin_sweep_cm: number;
  fin_x_le_cm: number;
};

export type DesignRevision = {
  id: string;
  name: string;
  createdAt: string;
  parts: Part[];
  geom: Geom;
};

const KEY = "rocket_revisions_v1";

export function loadRevisions(): DesignRevision[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DesignRevision[]) : [];
  } catch {
    return [];
  }
}

export function saveRevisions(revs: DesignRevision[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(revs));
}
