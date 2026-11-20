// Modified for TRACEFOLIO (2026): responsive shared workflow steps.

import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function WorkflowStepper({
  labels,
  current,
  onStepChange,
}: {
  labels: string[];
  current: number;
  onStepChange?: (index: number) => void;
}) {
  return (
    <ol
      className="grid overflow-hidden rounded-xl border border-line bg-surface"
      style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}
    >
      {labels.map((label, index) => (
        <li
          key={label}
          aria-current={index === current ? "step" : undefined}
          className={cn(
            "min-w-0 border-r border-line text-ui-meta last:border-r-0 sm:text-ui-body",
            index === current ? "bg-brand-muted text-brand" : index < current ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <button
            type="button"
            disabled={!onStepChange}
            onClick={() => onStepChange?.(index)}
            className="flex min-h-[56px] w-full min-w-0 flex-col items-center gap-1 p-2 text-center focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:cursor-default sm:flex-row sm:gap-3 sm:px-4 sm:py-3 sm:text-left"
          >
            <span aria-hidden className={cn("grid size-7 shrink-0 place-items-center rounded-full border text-xs", index <= current && "border-brand bg-brand text-primary-foreground")}>
              {index < current ? <CheckCircle2 className="size-4" /> : index + 1}
            </span>
            <span className="min-w-0 font-medium [overflow-wrap:anywhere]">{label}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
