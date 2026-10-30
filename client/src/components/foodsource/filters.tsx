import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { MetaResponse, MoqUnit, SupplierFilters } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface Props {
  meta?: MetaResponse | undefined;
  filters: SupplierFilters;
  search: string;
  onSearchChange: (q: string) => void;
  onChange: (patch: Partial<SupplierFilters>) => void;
  onReset: () => void;
}

const ALL = "__all";

export function Filters({ meta, filters, search, onSearchChange, onChange, onReset }: Props) {
  const cities = (meta?.cities ?? []).filter((c) => !filters.region || c.region === filters.region);
  const hasActive =
    !!filters.category ||
    !!filters.region ||
    !!filters.city ||
    !!filters.has_certificates ||
    filters.min_order_max != null ||
    !!search;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Фильтры</h2>
        {hasActive && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw /> Сбросить
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Название или описание"
          className="pl-9"
          aria-label="Поиск по тексту"
        />
      </div>

      <fieldset className="space-y-2.5">
        <legend className="mb-2.5 text-sm font-semibold">Категория</legend>
        <div className="flex flex-wrap gap-2">
          {[{ value: undefined, label: "Все" }, ...(meta?.categories ?? [])].map((c) => {
            const active = filters.category === c.value;
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => onChange({ category: c.value })}
                aria-pressed={active}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "bg-ink text-ink-foreground" : "bg-secondary hover:bg-border",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Регион</Label>
        <Select
          value={filters.region ?? ALL}
          onValueChange={(v) => onChange({ region: v === ALL ? undefined : v, city: undefined })}
        >
          <SelectTrigger aria-label="Регион">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все регионы</SelectItem>
            {meta?.regions.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Город</Label>
        <Select
          value={filters.city ?? ALL}
          onValueChange={(v) => onChange({ city: v === ALL ? undefined : v })}
        >
          <SelectTrigger aria-label="Город">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все города</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.city} value={c.city}>
                {c.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-3">
        <span className="text-sm font-semibold">Есть сертификаты</span>
        <Switch
          checked={!!filters.has_certificates}
          onCheckedChange={(v) => onChange({ has_certificates: v || undefined })}
        />
      </label>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">MOQ не более</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Напр. 500"
            value={filters.min_order_max ?? ""}
            onChange={(e) =>
              onChange({
                min_order_max: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            aria-label="Максимальный MOQ"
          />
          <Select
            value={filters.min_order_unit ?? "кг"}
            onValueChange={(v) => onChange({ min_order_unit: v as MoqUnit })}
          >
            <SelectTrigger className="w-24" aria-label="Единица MOQ">
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
      </div>
    </div>
  );
}
