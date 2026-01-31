import { Revision } from "./types";

const KEY = "rocket_revisions";

export function loadRevisions(): Revision[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Revision[]) : [];
  } catch {
    return [];
  }
}

export function saveRevisions(revs: Revision[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(revs));
}
