import { NotebookPen } from "lucide-react";
import { STATUS_LABELS, type UserNote } from "@/hooks/use-notes";
import { cn } from "@/lib/utils";

const TONE: Record<UserNote["status"], string> = {
  new: "bg-secondary text-foreground",
  contacted: "bg-primary-soft text-foreground",
  requested: "bg-success-soft text-success",
  rejected: "bg-destructive-soft text-destructive",
};

export function StatusChip({
  note,
  className,
}: {
  note?: UserNote | undefined;
  className?: string | undefined;
}) {
  if (!note) return null;
  return (
    <span
      title={note.text || undefined}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        TONE[note.status],
        className,
      )}
    >
      <NotebookPen className="size-3" />
      {STATUS_LABELS[note.status]}
    </span>
  );
}
