"use client";

// Modified for TRACEFOLIO (2026): aligned resume record cards.

import type { RefObject } from "react";
import { ArrowDownUp, Copy, FileText, LayoutGrid, List, Plus, Search, Trash2, Upload } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecordCard, RecordCardAction } from "@/components/ui/record-card";
import type { ResumeLibraryCard, ResumeLibrarySortMode } from "@/lib/resume-library";
import { RESUME_UPLOAD_ACCEPT } from "@/lib/resume-upload";
import { cn } from "@/lib/utils";

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
    <section className="text-foreground">
      <div className="flex flex-col">
        <header className="flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-ui-title font-semibold lg:text-ui-title-wide">{t("title")}</h1>
            {status !== savedStatus && <p className="mt-3 text-xs text-muted-foreground">{status}</p>}
          </div>

          <div className="flex flex-wrap gap-2">
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
        </header>

        <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex h-11 w-full max-w-md items-center gap-3 rounded-lg border border-line bg-surface px-3 text-sm text-muted-foreground shadow-sm">
            <Search className="h-4 w-4" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("search")}
              className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>

          <div className="flex items-center gap-2">
            <label className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm">
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
            <div className="flex h-10 overflow-hidden rounded-lg border border-line bg-surface">
              <button
                type="button"
                onClick={() => onViewModeChange("grid")}
                className={cn("grid w-10 place-items-center", viewMode === "grid" && "bg-primary text-white")}
                aria-label={t("gridView")}
                title={t("gridView")}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("list")}
                className={cn("grid w-10 place-items-center", viewMode === "list" && "bg-primary text-white")}
                aria-label={t("listView")}
                title={t("listView")}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-7",
            viewMode === "grid"
              ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col gap-3",
          )}
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
          <div className="mt-12 grid min-h-48 place-items-center rounded-xl border border-dashed border-line text-sm text-muted-foreground">
            {t("empty")}
          </div>
        )}
      </div>
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
