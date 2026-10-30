import { useQuery } from "@tanstack/react-query";
import { Award, Lightbulb } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { recommendQuery } from "@/lib/api/queries";
import type { QueryBrief } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function RecommendBanner({
  brief,
  onOpen,
}: {
  brief: QueryBrief;
  onOpen: (id: number) => void;
}) {
  const { data, isLoading } = useQuery(recommendQuery(brief));

  return (
    <section className="rounded-3xl bg-ink p-5 text-ink-foreground sm:p-6">
      <div className="flex items-center gap-2">
        <Lightbulb className="size-5 text-primary" />
        <h2 className="font-display text-lg font-bold">Рекомендации для вашего запроса</h2>
      </div>
      {isLoading || !data ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-3/4 bg-ink-foreground/10" />
          <Skeleton className="h-16 w-full bg-ink-foreground/10" />
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-ink-muted">{data.explanation}</p>
          <ol className="mt-4 grid gap-2 md:grid-cols-3">
            {data.items.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onOpen(s.id)}
                  className={cn(
                    "flex h-full w-full flex-col gap-2 rounded-2xl p-4 text-left transition-colors",
                    i === 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-ink-foreground/8 hover:bg-ink-foreground/12",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
                      {i === 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <Award className="size-3.5" /> Лучший выбор
                        </span>
                      ) : (
                        `#${i + 1}`
                      )}
                    </span>
                    <span className="font-display text-xl font-bold tabular">{s.score}</span>
                  </span>
                  <span className="font-semibold leading-tight">{s.name}</span>
                  <span className="text-xs opacity-75">
                    {s.score_reasons.join(" · ") || "Нет совпадений"}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-ink-muted">
            Веса: категория +{data.weights.category}, регион +{data.weights.region}, сертификаты +
            {data.weights.certificates}, MOQ +{data.weights.moq}, бюджет +{data.weights.budget},
            контакты до +{data.weights.contacts}, свежесть данных +{data.weights.freshness}.
          </p>
        </>
      )}
    </section>
  );
}
