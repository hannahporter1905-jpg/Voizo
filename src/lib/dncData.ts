import { supabase } from "./supabase";

export interface DncEntry {
  id: number;
  phoneNumber: string;
  addedAt: string;
}

const LS_KEY = "dnc_entries_v2";

// ── localStorage helpers ──────────────────────────────────────────────────────
function lsLoad(): DncEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function lsSave(entries: DncEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(entries));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToEntry(row: any): DncEntry {
  return {
    id: row.id,
    phoneNumber: row.phone_number,
    addedAt: new Date(row.added_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchDncEntries(): Promise<DncEntry[]> {
  try {
    const { data, error } = await supabase
      .from("do_not_call")
      .select("*")
      .order("added_at", { ascending: false });

    if (!error && data) {
      const entries = data.map(rowToEntry);
      lsSave(entries); // keep local cache in sync
      return entries;
    }
  } catch {
    // Supabase unavailable — fall through to local
  }
  return lsLoad();
}

export async function insertDncEntries(phoneNumbers: string[]): Promise<DncEntry[]> {
  const trimmed = phoneNumbers.map((n) => n.trim()).filter(Boolean);

  try {
    const rows = trimmed.map((n) => ({ phone_number: n }));
    const { data, error } = await supabase
      .from("do_not_call")
      .upsert(rows, { onConflict: "phone_number", ignoreDuplicates: true })
      .select();

    if (!error && data) {
      const inserted = data.map(rowToEntry);
      // Merge into local cache
      const cached = lsLoad();
      const existingNums = new Set(cached.map((e) => e.phoneNumber));
      const fresh = inserted.filter((e) => !existingNums.has(e.phoneNumber));
      lsSave([...fresh, ...cached]);
      return inserted;
    }
  } catch {
    // Supabase unavailable — fall through to local
  }

  // Local fallback
  const existing = lsLoad();
  const existingNums = new Set(existing.map((e) => e.phoneNumber));
  const now = formatDate();
  const fresh: DncEntry[] = trimmed
    .filter((n) => !existingNums.has(n))
    .map((n, i) => ({ id: Date.now() + i, phoneNumber: n, addedAt: now }));
  lsSave([...fresh, ...existing]);
  return fresh;
}

export async function deleteDncEntry(id: number): Promise<void> {
  try {
    await supabase.from("do_not_call").delete().eq("id", id);
  } catch {
    // ignore Supabase errors — always remove locally
  }
  lsSave(lsLoad().filter((e) => e.id !== id));
}
