import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-card px-6 py-16 text-center shadow-card">
      <span className="grid size-16 place-items-center rounded-3xl bg-primary-soft">
        <SearchX className="size-7" />
      </span>
      <h3 className="mt-5 font-display text-2xl font-bold">Никого не нашли</h3>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Расширьте регион или снимите фильтр сертификатов — часть поставщиков не указывает MOQ.
      </p>
      <Button className="mt-6" variant="ink" onClick={onReset}>
        Сбросить фильтры
      </Button>
    </div>
  );
}
