"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Evidence, GrowthAction } from "@/lib/career/domain";

export function GrowthPlanCard({
  action,
  candidates,
  completionEvidence,
  busy,
  onAddEvidence,
  onSave,
}: {
  action: GrowthAction;
  candidates: Evidence[];
  completionEvidence?: Evidence;
  busy: boolean;
  onAddEvidence: () => void;
  onSave: (evidenceId: string | null) => Promise<boolean>;
}) {
  const t = useTranslations("app.careerWorkspace.growthPlan");
  const fieldId = useId();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = candidates.find((candidate) => candidate.id === selectedId);
  const done = action.status === "done";

  return (
    <article data-slot="growth-plan-card" className="grid min-w-0 gap-ui-block rounded-xl border border-line bg-surface p-ui-block sm:p-ui-section">
      <header>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-ui-block">
          <h2 className="min-w-0 text-ui-label font-semibold [overflow-wrap:anywhere]">{action.title}</h2>
          <p className={done ? "text-right text-ui-meta font-medium text-success" : "text-right text-ui-meta font-medium text-muted-foreground"}>
            {done ? t("done") : t("open")}
          </p>
        </div>
        <p className="mt-1 text-ui-body text-muted-foreground [overflow-wrap:anywhere]">{action.evidenceTarget}</p>
      </header>

      {done ? (
        <div className="flex flex-wrap items-center justify-between gap-ui-control border-t border-line pt-ui-block">
          <p className="min-w-0 text-ui-meta text-muted-foreground [overflow-wrap:anywhere]">
            {t("completedWith", { title: completionEvidence?.title ?? t("missingEvidence") })}
          </p>
          <Button type="button" variant="outline" className="h-ui-field" disabled={busy} onClick={() => void onSave(null)}>{t("reopen")}</Button>
        </div>
      ) : candidates.length ? (
        <form
          className="grid min-w-0 gap-ui-control border-t border-line pt-ui-block"
          onSubmit={async (event) => {
            event.preventDefault();
            if (selected && !busy && await onSave(selected.id)) setSelectedId(null);
          }}
        >
          <label htmlFor={fieldId} className="text-ui-meta font-medium">{t("completionEvidence")}</label>
          <div data-slot="growth-completion-controls" className="grid min-w-0 items-center gap-ui-control sm:grid-cols-[minmax(0,1fr)_auto]">
            <Select value={selected?.id ?? null} onValueChange={setSelectedId} disabled={busy}>
              <SelectTrigger id={fieldId} className="w-full min-w-0 data-[size=default]:h-ui-field">
                <SelectValue placeholder={t("chooseEvidence")}>
                  {selected ? <span className="min-w-0 truncate" title={selected.title}>{selected.title}</span> : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start" alignItemWithTrigger={false} className="max-w-[calc(100vw-32px)]">
                {candidates.map((item) => <SelectItem key={item.id} value={item.id} className="[&_[data-slot=select-item-text]]:min-w-0 [&_[data-slot=select-item-text]]:shrink [&_[data-slot=select-item-text]]:whitespace-normal [&_[data-slot=select-item-text]]:[overflow-wrap:anywhere]">{item.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button type="submit" className="h-ui-field" disabled={busy || !selected}>{t("complete")}</Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-ui-control border-t border-line pt-ui-block">
          <p className="text-ui-meta text-muted-foreground">{t("noEligibleEvidence")}</p>
          <Button type="button" variant="outline" className="h-ui-field" onClick={onAddEvidence}>{t("addEvidence")}</Button>
        </div>
      )}
    </article>
  );
}
