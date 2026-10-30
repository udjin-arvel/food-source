import { GitCompareArrows, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  count: number;
  names: string[];
  onCompare: () => void;
  onClear: () => void;
}

export function CompareBar({ count, names, onCompare, onClear }: Props) {
  if (count === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 animate-in slide-in-from-bottom-4 fade-in">
      <div className="flex w-full max-w-2xl items-center gap-3 rounded-3xl bg-ink p-2.5 pl-5 text-ink-foreground shadow-float">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            Выбрано {count} из 3
            {count < 2 && (
              <span className="font-normal text-ink-muted"> — добавьте ещё одного</span>
            )}
          </p>
          <p className="truncate text-xs text-ink-muted">{names.join(" · ")}</p>
        </div>
        <Button variant="ghostInk" size="icon" onClick={onClear} aria-label="Очистить выбор">
          <X />
        </Button>
        <Button onClick={onCompare} disabled={count < 2} size="lg">
          <GitCompareArrows /> Сравнить
        </Button>
      </div>
    </div>
  );
}
