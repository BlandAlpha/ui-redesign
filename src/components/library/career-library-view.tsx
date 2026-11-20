"use client";

// Modified for TRACEFOLIO (2026): aligned job and artifact cards.

// Modified for TRACEFOLIO (2026): shared cool-gray / mist-blue application palette.

import { useMemo, useState } from "react";
import { FolderKanban, FolderOpen, Pencil, Search, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { InitialData } from "@/components/app/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecordCard, RecordCardAction } from "@/components/ui/record-card";
import {
  buildCareerArtifacts,
  buildCareerJobArchives,
  filterCareerArtifacts,
  filterCareerJobArchives,
  type CareerArtifact,
  type CareerArtifactCategory,
  type CareerLibraryGroup,
  type CareerJobArchive,
} from "@/lib/career-library";
import { cn } from "@/lib/utils";

export function CareerLibraryView({
  data,
  group,
  onGroupChange,
  onOpenJob,
  onUpdateJob,
  onDeleteJob,
  onOpenArtifact,
  onDeleteArtifact,
}: {
  data: Pick<InitialData, "versions" | "jobs" | "applications" | "interviews" | "interviewPreparations">;
  group: CareerLibraryGroup;
  onGroupChange: (group: CareerLibraryGroup) => void;
  onOpenJob: (id: string) => void;
  onUpdateJob: (id: string, company: string, title: string) => Promise<void>;
  onDeleteJob: (id: string) => void;
  onOpenArtifact: (artifact: CareerArtifact) => void;
  onDeleteArtifact: (artifact: CareerArtifact) => void;
}) {
  const t = useTranslations("careerLibrary");
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");
  const [editDraft, setEditDraft] = useState<{ id: string; company: string; title: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const artifacts = useMemo(() => buildCareerArtifacts(data), [data]);
  const archives = useMemo(
    () => buildCareerJobArchives(data, artifacts),
    [artifacts, data],
  );
  const visibleArtifacts = sortByUpdatedAt(filterCareerArtifacts(artifacts, query), sortOrder);
  const visibleArchives = sortByUpdatedAt(filterCareerJobArchives(archives, query), sortOrder);
  const hasItems = group === "job" ? visibleArchives.length > 0 : visibleArtifacts.length > 0;

  return (
    <section className="pb-12">
      <div className="flex flex-col gap-6 border-b border-line pb-7 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-ui-title font-semibold lg:text-ui-title-wide">{t("title")}</h1>
        </div>
        <div className="inline-flex self-start rounded-xl border border-line bg-surface-low p-1">
          {(["job", "type"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onGroupChange(item)}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-medium transition",
                group === item ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`groups.${item}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t(group === "job" ? "searchJobs" : "searchArtifacts")}
            className="h-12 w-full rounded-xl border border-line bg-surface pl-12 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
        </label>
        <select
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value as "recent" | "oldest")}
          className="h-12 rounded-xl border border-line bg-surface px-4 text-sm text-foreground outline-none focus:border-primary/40"
          aria-label={t("sortLabel")}
        >
          <option value="recent">{t("sortRecent")}</option>
          <option value="oldest">{t("sortOldest")}</option>
        </select>
      </div>

      {!hasItems ? (
        <div className="mt-12 grid min-h-72 place-items-center rounded-2xl border border-dashed border-line bg-surface-low/50 text-center">
          <div className="max-w-sm px-6">
            <FolderOpen className="mx-auto h-11 w-11 text-muted-foreground/60" strokeWidth={1.6} />
            <h2 className="mt-4 text-lg font-semibold text-foreground">{t("emptyTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(query ? "emptySearch" : "emptyDescription")}</p>
          </div>
        </div>
      ) : group === "job" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleArchives.map((archive) => {
            const jobId = archive.jobId;
            return (
              <LibraryCard
                key={archive.id}
                title={archive.role}
                context={[archive.company, archive.city].filter(Boolean).join(" · ")}
                metrics={jobMetrics(archive, t)}
                updatedAt={archive.updatedAt}
                badge={archive.status ? t(`status.${archive.status}`) : undefined}
                isSample={archive.isSample}
                onOpen={() => onOpenJob(archive.id)}
                onEdit={jobId ? () => setEditDraft({ id: jobId, company: archive.company, title: archive.role }) : undefined}
                onDelete={jobId ? () => onDeleteJob(jobId) : undefined}
              />
            );
          })}
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {(["resume", "analysis", "interview"] as CareerArtifactCategory[]).map((category) => {
            const items = visibleArtifacts.filter((artifact) => artifact.category === category);
            if (!items.length) return null;
            return (
              <section key={category}>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-ui-section font-semibold text-foreground">{t(`categories.${category}`)}</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((artifact) => (
                    <LibraryCard
                      key={artifact.key}
                      title={artifact.name}
                      context={t(`kinds.${artifact.kind}`)}
                      heading="h3"
                      metrics={artifactMetrics(artifact, t)}
                      updatedAt={artifact.updatedAt}
                      onOpen={() => onOpenArtifact(artifact)}
                      onDelete={() => onDeleteArtifact(artifact)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
      <Dialog open={Boolean(editDraft)} onOpenChange={(open) => { if (!open && !isSaving) setEditDraft(null); }}>
        <DialogContent>
          <form
            className="contents"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!editDraft) return;
              setIsSaving(true);
              try {
                await onUpdateJob(editDraft.id, editDraft.company.trim(), editDraft.title.trim());
                setEditDraft(null);
              } finally {
                setIsSaving(false);
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>{t("editJob.title")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="library-job-company">{t("editJob.company")}</Label>
                <Input
                  id="library-job-company"
                  value={editDraft?.company ?? ""}
                  maxLength={100}
                  onChange={(event) => setEditDraft((current) => current ? { ...current, company: event.target.value } : current)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="library-job-title">{t("editJob.role")}</Label>
                <Input
                  id="library-job-title"
                  value={editDraft?.title ?? ""}
                  maxLength={100}
                  onChange={(event) => setEditDraft((current) => current ? { ...current, title: event.target.value } : current)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" disabled={isSaving} />}>
                {t("editJob.cancel")}
              </DialogClose>
              <Button type="submit" disabled={isSaving || !editDraft?.company.trim() || !editDraft.title.trim()}>
                {isSaving ? t("editJob.saving") : t("editJob.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function LibraryCard({
  title,
  context,
  metrics,
  updatedAt,
  badge,
  isSample = false,
  onOpen,
  onEdit,
  onDelete,
  heading,
}: {
  title: string;
  context: string;
  metrics: string[];
  updatedAt: string;
  badge?: string;
  isSample?: boolean;
  onOpen: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  heading?: "h2" | "h3";
}) {
  const t = useTranslations("careerLibrary");
  const locale = useLocale();
  const date = new Date(updatedAt);
  const dateLabel = Number.isNaN(date.getTime()) ? updatedAt : date.toLocaleDateString(locale);

  return (
    <RecordCard
      heading={heading}
      title={title}
      onOpen={onOpen}
      context={(
        <>
          <FolderKanban aria-hidden className="size-4 shrink-0 text-brand" />
          <span className="truncate" title={context}>{context}</span>
        </>
      )}
      detail={metrics.join(" · ")}
      metadata={(
        <>
          <time className="shrink-0 tabular-nums" dateTime={updatedAt} aria-label={t("updatedAt", { date: dateLabel })}>{dateLabel}</time>
          <span className="flex min-w-0 items-center gap-2">
            {isSample ? <Badge variant="outline" className="shrink-0">{t("sampleJob")}</Badge> : null}
            {badge ? <span className="truncate" title={badge}>{badge}</span> : null}
          </span>
        </>
      )}
      actions={(onEdit || onDelete) && (
        <>
          {onEdit ? <RecordCardAction label={t("editJob.action")} onClick={onEdit}><Pencil aria-hidden /></RecordCardAction> : null}
          {onDelete ? <RecordCardAction label={t("delete")} onClick={onDelete} destructive><Trash2 aria-hidden /></RecordCardAction> : null}
        </>
      )}
    />
  );
}

function jobMetrics(archive: CareerJobArchive, t: ReturnType<typeof useTranslations>) {
  const { counts } = archive;
  return [
    counts.analyses ? t("metrics.jobAnalysis", { count: counts.analyses }) : "",
    counts.tailoredResumes ? t("metrics.tailoredResume", { count: counts.tailoredResumes }) : "",
    counts.preparations ? t("metrics.preparation", { count: counts.preparations }) : "",
    counts.interviews ? t("metrics.interview", { count: counts.interviews }) : "",
  ].filter(Boolean);
}

function artifactMetrics(artifact: CareerArtifact, t: ReturnType<typeof useTranslations>) {
  const [first, second, third] = artifact.metrics;
  switch (artifact.kind) {
    case "general-resume":
    case "tailored-resume":
      return [t("metrics.issues", { count: first }), t("metrics.sections", { count: second }), t("metrics.changes", { count: third })];
    case "job-analysis":
      return [t("metrics.originalJd", { count: first })];
    case "interview-preparation":
      return [t("metrics.topics", { count: first }), t("metrics.questions", { count: second }), t("metrics.deepDives", { count: third })];
    case "interview-session":
      return [t("metrics.questions", { count: first }), t("metrics.answers", { count: second }), third ? t("metrics.hasFeedback") : t("metrics.noFeedback")];
  }
}

function sortByUpdatedAt<T extends { updatedAt: string }>(items: T[], order: "recent" | "oldest") {
  return [...items].sort((left, right) =>
    order === "recent"
      ? right.updatedAt.localeCompare(left.updatedAt)
      : left.updatedAt.localeCompare(right.updatedAt),
  );
}
