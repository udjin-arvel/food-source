import { useCallback, useEffect, useState } from "react";

export type NoteStatus = "new" | "contacted" | "requested" | "rejected";

export interface UserNote {
  supplier_id: number;
  status: NoteStatus;
  text: string;
  updated_at: string;
}

export const STATUS_LABELS: Record<NoteStatus, string> = {
  new: "Новый",
  contacted: "Связался",
  requested: "Запросил КП",
  rejected: "Отказ",
};

const KEY = "foodsource.notes.v1";
const EVENT = "foodsource:notes";

function read(): Record<number, UserNote> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Заметки и статусы по поставщикам, хранятся в localStorage и синхронизируются между компонентами. */
export function useNotes() {
  const [notes, setNotes] = useState<Record<number, UserNote>>({});

  useEffect(() => {
    setNotes(read());
    const sync = () => setNotes(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const saveNote = useCallback(
    (supplier_id: number, patch: Partial<Pick<UserNote, "status" | "text">>) => {
      const all = read();
      const prev = all[supplier_id] ?? { supplier_id, status: "new" as NoteStatus, text: "" };
      all[supplier_id] = { ...prev, ...patch, supplier_id, updated_at: new Date().toISOString() };
      window.localStorage.setItem(KEY, JSON.stringify(all));
      window.dispatchEvent(new Event(EVENT));
    },
    [],
  );

  return { notes, saveNote };
}

export function readNote(supplierId: number): UserNote | undefined {
  return read()[supplierId];
}
