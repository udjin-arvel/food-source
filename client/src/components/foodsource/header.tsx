import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IS_MOCK } from "@/lib/api/client";

export function Header({
  shortlistCount,
  onExport,
}: {
  shortlistCount: number;
  onExport: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary font-display text-lg font-black">
            F
          </span>
          <span className="font-display text-xl font-extrabold">
            Food<span className="text-muted-foreground">Source</span>
          </span>
        </a>
        <span className="hidden rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline">
          помощник закупщика
        </span>
        <div className="ml-auto flex items-center gap-2">
          {IS_MOCK && (
            <span
              className="hidden rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium md:inline"
              title="Данные демо-сида. Укажите VITE_API_URL, чтобы подключить FastAPI-бэкенд."
            >
              Демо-данные
            </span>
          )}
          <Button variant="secondary" size="sm" onClick={onExport} disabled={shortlistCount === 0}>
            <Download /> Шортлист CSV{shortlistCount > 0 && ` · ${shortlistCount}`}
          </Button>
        </div>
      </div>
    </header>
  );
}
