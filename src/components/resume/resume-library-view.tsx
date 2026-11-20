"use client";

// Modified for TRACEFOLIO (2026): aligned resume record cards.

import type { RefObject } from "react";
import { ArrowDownUp, Copy, FileText, LayoutGrid, List, Plus, Trash2, Upload } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { WorkspaceHeading } from "@/components/app/app-page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecordCard, RecordCardAction } from "@/components/ui/record-card";
import type { ResumeLibraryCard, ResumeLibrarySortMode } from "@/lib/resume-library";
import { RESUME_UPLOAD_ACCEPT } from "@/lib/resume-upload";

export type ResumeLibraryViewMode = "grid" | "list";

export function ResumeLibraryView({
  cards,
  status,
  savedStatus,
  search,
  sortMode,
  viewMode,
  isImportingResume,
  importInputRef,
  onImportFile,
  onImportButtonClick,
  onCreateResume,
  onSearchChange,
  onSortModeChange,
  onViewModeChange,
  onOpenCard,
  onCopyCard,
  onDeleteCard,
  copyingCardId,
}: {
  cards: ResumeLibraryCard[];
  status: string;
  savedStatus: string;
  search: string;
  sortMode: ResumeLibrarySortMode;
  viewMode: ResumeLibraryViewMode;
  isImportingResume: boolean;
  importInputRef: RefObject<HTMLInputElement | null>;
  onImportFile: (file?: File) => void;
  onImportButtonClick: () => void;
  onCreateResume: () => void;
  onSearchChange: (value: string) => void;
  onSortModeChange: (value: ResumeLibrarySortMode) => void;
  onViewModeChange: (value: ResumeLibraryViewMode) => void;
  onOpenCard: (card: ResumeLibraryCard) => void;
  onCopyCard: (card: ResumeLibraryCard) => void;
  onDeleteCard: (card: ResumeLibraryCard) => void;
  copyingCardId?: string;
}) {
  const t = useTranslations("app.resumeLibrary");

  return (
    <section className="workspace-stack">
      <WorkspaceHeading title={t("title")}>
        <div className="flex flex-wrap items-center gap-ui-control">
          {status !== savedStatus && <p role="status" className="text-ui-meta text-muted-foreground">{status}</p>}
          <input
            ref={importInputRef}
            type="file"
            className="hidden"
            accept={RESUME_UPLOAD_ACCEPT}
            onChange={(event) => {
              onImportFile(event.currentTarget.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
          <Button
            variant="outline"
            onClick={onImportButtonClick}
            className="gap-2"
            disabled={isImportingResume}
          >
            <Upload className="h-4 w-4" />
            {isImportingResume ? t("importing") : t("import")}
          </Button>
          <Button onClick={onCreateResume} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("create")}
          </Button>
        </div>
      </WorkspaceHeading>

      <div className="flex flex-wrap items-center justify-between gap-ui-control">
        <SearchInput aria-label={t("search")} placeholder={t("search")} value={search} onChange={(event) => onSearchChange(event.target.value)} className="w-full max-w-md sm:min-w-48 sm:flex-1" />

        <div className="flex items-center gap-2">
          <label className="flex h-ui-field items-center gap-ui-control rounded-lg border border-input bg-surface px-3 text-ui-meta focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortMode}
              onChange={(event) => onSortModeChange(event.target.value as ResumeLibrarySortMode)}
              className="bg-transparent outline-none"
            >
              <option value="recent">{t("sortRecent")}</option>
              <option value="recentOptimized">{t("sortRecentOptimized")}</option>
            </select>
          </label>
          <div className="segment-group">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className="segment-item w-9" aria-pressed={viewMode === "grid"}
              aria-label={t("gridView")}
              title={t("gridView")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className="segment-item w-9" aria-pressed={viewMode === "list"}
              aria-label={t("listView")}
              title={t("listView")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={viewMode === "grid" ? "grid gap-ui-block sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-ui-block"}
        hidden={cards.length === 0}
      >
        {cards.map((card) => (
          <ResumeCard
            key={card.id}
            card={card}
            onOpen={() => onOpenCard(card)}
            onCopy={() => onCopyCard(card)}
            onDelete={() => onDeleteCard(card)}
            copyDisabled={Boolean(copyingCardId)}
          />
        ))}
      </div>

      {cards.length === 0 && (
        <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-line text-sm text-muted-foreground">
          {t("empty")}
        </div>
      )}
    </section>
  );
}

function ResumeCard({
  card,
  onOpen,
  onCopy,
  onDelete,
  copyDisabled,
}: {
  card: ResumeLibraryCard;
  onOpen: () => void;
  onCopy: () => void;
  onDelete: () => void;
  copyDisabled: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("app.resumeLibrary");
  const kindLabel = card.optimizationKind === "job"
    ? t("kind.jobOptimized")
    : card.optimizationKind === "general"
      ? t("kind.generalOptimized")
      : t("kind.original");
  const updatedAtLabel = card.updatedAtDate
    ? t(`updatedAt.${card.updatedAtKind}`, { date: new Date(card.updatedAtDate).toLocaleDateString(locale) })
    : t(`updatedAt.${card.updatedAtKind}`);

  return (
    <RecordCard
      title={card.title}
      onOpen={onOpen}
      context={<><FileText aria-hidden className="size-4 shrink-0 text-brand" /><span className="truncate">{kindLabel}</span></>}
      detail={card.detail}
      metadata={(
        <>
          <Badge variant="secondary">{t(`templates.${card.templateKey}`)}</Badge>
          <span className="min-w-0 truncate tabular-nums" title={updatedAtLabel}>{updatedAtLabel}</span>
        </>
      )}
      actions={(
        <>
          <RecordCardAction label={t("copy")} onClick={onCopy} disabled={copyDisabled}><Copy aria-hidden /></RecordCardAction>
          <RecordCardAction label={t(card.id === "main" ? "deleteOriginal" : "deleteResume")} onClick={onDelete} destructive><Trash2 aria-hidden /></RecordCardAction>
        </>
      )}
    />
  );
}
