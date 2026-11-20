import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardList,
  FilePenLine,
  Mic,
  Plus,
  Target,
  Trophy,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  DASHBOARD_STAGE_STATUSES,
  type DashboardSummary,
  type DashboardTarget,
} from "@/lib/dashboard";
import type { ApplicationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type DashboardWorkspaceProps = {
  summary: DashboardSummary;
  onNavigate: (target: DashboardTarget) => void;
  onAddApplication: () => void;
};

const actionRowMeta = [
  { badge: "bg-destructive-soft text-destructive", hover: "hover:bg-destructive-soft/50" },
  { badge: "bg-warning-soft text-warning", hover: "hover:bg-warning-soft/50" },
  { badge: "bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200", hover: "hover:bg-blue-50" },
] as const;

const stageMeta: Record<ApplicationStatus, { bar: string }> = {
  APPLIED: { bar: "bg-primary" },
  ASSESSMENT: { bar: "bg-chart-5" },
  INTERVIEW: { bar: "bg-chart-4" },
  OFFER: { bar: "bg-chart-1" },
  REJECTED: { bar: "bg-destructive" },
  ARCHIVED: { bar: "bg-zinc-400" },
};

export function DashboardWorkspace({ summary, onNavigate, onAddApplication }: DashboardWorkspaceProps) {
  const t = useTranslations("app.dashboard");
  const maxStageCount = Math.max(1, ...Object.values(summary.stageCounts));

  return (
    <div className="workspace-stack">
      <section className="grid grid-cols-2 gap-ui-block xl:grid-cols-4">
        <MetricButton icon={BriefcaseBusiness} label={t("metrics.submitted")} value={summary.metrics.submitted} onClick={() => onNavigate("pipeline")} />
        <MetricButton icon={ClipboardList} label={t("metrics.active")} value={summary.metrics.active} onClick={() => onNavigate("pipeline")} />
        <MetricButton icon={CalendarClock} label={t("metrics.followUpsDue")} value={summary.metrics.followUpsDue} onClick={() => onNavigate("pipeline")} />
        <MetricButton icon={Trophy} label={t("metrics.offers")} value={summary.metrics.offers} onClick={() => onNavigate("pipeline")} />
      </section>

      <div className="workspace-grid">
        <DashboardSection title={t("sections.actions")} className="workspace-span-8">
          <div className="divide-y divide-line">
            {summary.actions.map((action, index) => {
              const rowMeta = actionRowMeta[index] ?? actionRowMeta[2];
              const actionKey = action.status === "ASSESSMENT" || action.status === "INTERVIEW"
                ? action.status
                : "DEFAULT";
              return (
              <button
                key={action.applicationId}
                type="button"
                onClick={() => onNavigate(action.target)}
                className={cn(
                  "group flex w-full items-center gap-3 px-2 py-3.5 text-left transition-colors",
                  rowMeta.hover,
                )}
              >
                <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold", rowMeta.badge)}>
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 items-center gap-1 text-sm font-semibold text-foreground group-hover:text-primary">
                    <span className="truncate">
                      {t(`actions.${actionKey}`, { company: action.company, title: action.titleText })}
                    </span>
                    {action.isDue ? <span className="shrink-0">{t("overdueSuffix")}</span> : null}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {t(`schedule.${action.scheduleKey}`)}: {action.date}
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
              </button>
              );
            })}
            {!summary.actions.length ? (
              <p className="py-6 text-sm text-muted-foreground">{t("emptyActions")}</p>
            ) : null}
          </div>
        </DashboardSection>

        <DashboardSection title={t("sections.quickStart")} className="workspace-span-4">
          <div className="divide-y divide-line">
            <QuickAction icon={FilePenLine} label={t("quickActions.resume")} onClick={() => onNavigate("resume")} />
            <QuickAction icon={Target} label={t("quickActions.match")} onClick={() => onNavigate("match")} />
            <QuickAction icon={Plus} label={t("quickActions.pipeline")} onClick={onAddApplication} />
            <QuickAction icon={Mic} label={t("quickActions.interview")} onClick={() => onNavigate("interview")} />
          </div>
        </DashboardSection>
      </div>

      <DashboardSection title={t("sections.stages")}>
          <div className="space-y-4 py-2">
            {DASHBOARD_STAGE_STATUSES.map((status) => {
              const count = summary.stageCounts[status];
              const meta = stageMeta[status];
              return (
                <div key={status} className="grid grid-cols-[88px_minmax(0,1fr)_28px] items-center gap-3">
                  <span className="text-xs text-muted-foreground">{t(`stages.${status}`)}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-mid">
                    <div
                      className={cn("h-full rounded-full", meta.bar)}
                      style={{ width: `${count ? Math.max(8, (count / maxStageCount) * 100) : 0}%` }}
                    />
                  </div>
                  <span className="text-right text-sm font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
      </DashboardSection>
    </div>
  );
}

function MetricButton({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-20 min-w-0 items-center justify-between gap-2 rounded-xl border border-line bg-surface p-3 text-left transition-colors duration-150 hover:border-primary/35 hover:bg-brand-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-4"
    >
      <span>
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span className="mt-2 block text-2xl font-semibold tabular-nums">{value}</span>
      </span>
      <Icon aria-hidden className="size-5 shrink-0 text-brand" />
    </button>
  );
}

function DashboardSection({
  title,
  actionLabel,
  onAction,
  children,
  className,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grid min-w-0 grid-cols-1 gap-ui-block rounded-xl border border-line bg-surface p-ui-block sm:p-ui-section", className)}>
      <header className="flex flex-wrap items-center justify-between gap-ui-control">
        <h2 className="text-ui-section font-semibold">{title}</h2>
        {actionLabel && onAction ? (
          <button type="button" onClick={onAction} className="text-xs font-medium text-primary hover:underline">
            {actionLabel}
          </button>
        ) : null}
      </header>
      <div>{children}</div>
    </section>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: typeof Target; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-16 w-full items-center gap-3 px-3 py-3 text-left hover:bg-surface-low"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
      <span className="text-sm font-medium">{label}</span>
      <ArrowRight className="ml-auto size-3.5 shrink-0 text-muted-foreground/70 group-hover:text-primary" />
    </button>
  );
}
