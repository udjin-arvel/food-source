import { AlertTriangle, Award, Clock, PhoneOff, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SupplierWithScore } from "@/lib/api/types";

export function deliversNationwide(s: SupplierWithScore) {
  return !!s.delivery_terms && /по рф/i.test(s.delivery_terms);
}

export function SupplierBadges({
  supplier,
  compact,
}: {
  supplier: SupplierWithScore;
  compact?: boolean;
}) {
  const s = supplier;
  return (
    <div className="flex flex-wrap gap-1.5">
      {s.rank_badge === "best" && (
        <Badge variant="best">
          <Award /> Лучший выбор
        </Badge>
      )}
      {s.rank_badge === "top" && (
        <Badge variant="default">
          <Sparkles /> Топ-3
        </Badge>
      )}
      {s.has_certificates && (
        <Badge variant="success">
          <ShieldCheck /> Сертификаты
        </Badge>
      )}
      {deliversNationwide(s) && !compact && (
        <Badge variant="secondary">
          <Truck /> Доставка по РФ
        </Badge>
      )}
      {s.flags.includes("no_contacts") && (
        <Badge variant="destructive">
          <PhoneOff /> Нет контактов
        </Badge>
      )}
      {s.flags.includes("stale") && (
        <Badge variant="warning">{compact ? <AlertTriangle /> : <Clock />} Данные устарели</Badge>
      )}
    </div>
  );
}
