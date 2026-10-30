import { useEffect, useState } from "react";
import { Check, NotebookPen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { readNote, STATUS_LABELS, useNotes, type NoteStatus } from "@/hooks/use-notes";

export function NotesPanel({ supplierId, autoFocus }: { supplierId: number; autoFocus?: boolean }) {
  const { notes, saveNote } = useNotes();
  const note = notes[supplierId];
  const [text, setText] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // берём текст напрямую из хранилища только при открытии карточки поставщика
  useEffect(() => {
    setText(readNote(supplierId)?.text ?? "");
    setSavedAt(null);
  }, [supplierId]);

  // автосохранение текста с небольшой задержкой
  useEffect(() => {
    if ((readNote(supplierId)?.text ?? "") === text) return;
    const t = setTimeout(() => {
      saveNote(supplierId, { text });
      setSavedAt(new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }));
    }, 500);
    return () => clearTimeout(t);
  }, [text, supplierId, saveNote]);

  return (
    <section className="rounded-3xl bg-primary-soft p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold">
          <NotebookPen className="size-5" /> Моя заметка
        </h3>
        {(savedAt || note) && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Check className="size-3.5" /> Сохранено
            {savedAt
              ? ` в ${savedAt}`
              : note && ` ${new Date(note.updated_at).toLocaleDateString("ru-RU")}`}
          </span>
        )}
      </div>
      <div className="mt-4 space-y-3">
        <Select
          value={note?.status ?? ""}
          onValueChange={(v) => {
            saveNote(supplierId, { status: v as NoteStatus, text });
            setSavedAt(
              new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
            );
          }}
        >
          <SelectTrigger className="bg-card" aria-label="Статус работы с поставщиком">
            <SelectValue placeholder="Статус не выбран" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(STATUS_LABELS) as NoteStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea
          autoFocus={autoFocus}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Договорённости, условия, кому перезвонить…"
          rows={4}
          className="bg-card"
          aria-label="Текст заметки"
        />
        <p className="text-xs text-muted-foreground">Заметки хранятся только в этом браузере.</p>
      </div>
    </section>
  );
}
