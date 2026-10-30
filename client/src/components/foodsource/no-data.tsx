import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Пустое поле → «—» с тултипом «нет данных» (ТЗ 7.4). */
export function NoData() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="cursor-help text-muted-foreground">
          —
        </span>
      </TooltipTrigger>
      <TooltipContent>Нет данных</TooltipContent>
    </Tooltip>
  );
}

export function Value({ children }: { children?: ReactNode }) {
  if (children === null || children === undefined || children === "") return <NoData />;
  return <>{children}</>;
}
