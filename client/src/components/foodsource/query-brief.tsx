import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Category, MetaResponse, MoqUnit, QueryBrief as Brief } from "@/lib/api/types";
import supplies from "@/assets/supplies.png";

const ANY = "__any";

interface Props {
  meta?: MetaResponse | undefined;
  active: Brief | null;
  onSubmit: (brief: Brief) => void;
  onClear: () => void;
}

export function QueryBrief({ meta, active, onSubmit, onClear }: Props) {
  const [category, setCategory] = useState<Category | undefined>(active?.category);
  const [region, setRegion] = useState<string | undefined>(active?.region);
  const [moq, setMoq] = useState<string>(active?.max_min_order?.toString() ?? "");
  const [unit, setUnit] = useState<MoqUnit>(active?.max_min_order_unit ?? "кг");
  const [certs, setCerts] = useState<boolean>(!!active?.need_certificates);
  const [budget, setBudget] = useState<string>(active?.budget_per_unit?.toString() ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      category,
      region,
      max_min_order: moq === "" ? undefined : Number(moq),
      max_min_order_unit: moq === "" ? undefined : unit,
      need_certificates: certs || undefined,
      budget_per_unit: budget === "" ? undefined : Number(budget),
    });
  }

  function clear() {
    setCategory(undefined);
    setRegion(undefined);
    setMoq("");
    setCerts(false);
    setBudget("");
    onClear();
  }

  return (
    <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-primary-foreground sm:p-7">
      <img
        src={supplies}
        alt=""
        width={1024}
        height={1024}
        className="pointer-events-none absolute -right-10 -top-6 hidden w-72 select-none lg:block xl:w-80"
      />
      <div className="relative lg:max-w-[calc(100%-16rem)]">
        <p className="text-sm font-semibold uppercase tracking-wider opacity-70">Мой запрос</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold leading-[1.05] sm:text-4xl">
          Кого закупаем сегодня?
        </h1>
        <p className="mt-2 max-w-xl text-sm opacity-80">
          Опишите задачу — подберём поставщиков и объясним, почему они выше в списке.
        </p>

        <form onSubmit={submit} className="mt-5 grid gap-2.5 sm:grid-cols-2 2xl:grid-cols-4">
          <Select
            value={category ?? ANY}
            onValueChange={(v) => setCategory(v === ANY ? undefined : (v as Category))}
          >
            <SelectTrigger className="h-12 bg-card" aria-label="Категория запроса">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Любая категория</SelectItem>
              {meta?.categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={region ?? ANY} onValueChange={(v) => setRegion(v === ANY ? undefined : v)}>
            <SelectTrigger className="h-12 bg-card" aria-label="Регион запроса">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Любой регион</SelectItem>
              {meta?.regions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1.5">
            <Input
              type="number"
              min={0}
              placeholder="Макс. MOQ"
              value={moq}
              onChange={(e) => setMoq(e.target.value)}
              className="h-12 bg-card"
              aria-label="Максимальный MOQ"
            />
            <Select value={unit} onValueChange={(v) => setUnit(v as MoqUnit)}>
              <SelectTrigger className="h-12 w-[5.5rem] bg-card" aria-label="Единица MOQ">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(meta?.units ?? ["кг", "шт", "упак"]).map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            type="number"
            min={0}
            placeholder="Бюджет ₽/ед."
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="h-12 bg-card"
            aria-label="Бюджет за единицу"
          />

          <div className="flex flex-wrap items-center gap-3 sm:col-span-2 2xl:col-span-4">
            <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl bg-card px-4">
              <Switch checked={certs} onCheckedChange={setCerts} />
              <span className="text-sm font-medium">Нужны сертификаты</span>
            </label>
            <Button type="submit" variant="ink" size="lg">
              <Sparkles /> Подобрать
            </Button>
            {active && (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={clear}
                className="hover:bg-primary-hover"
              >
                <X /> Сбросить запрос
              </Button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
