"use client";

// Modified for TRACEFOLIO (2026): shared workspace layout and title hierarchy.

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import type { NavKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AppPageHeader({
  active,
  pageTitle,
  pageSubtitle,
  showResumeHeader = false,
  isPending,
  toast,
  onAddApplication,
}: {
  active: NavKey;
  pageTitle?: string;
  pageSubtitle: string;
  showResumeHeader?: boolean;
  isPending: boolean;
  toast: string;
  onAddApplication: () => void;
}) {
  const t = useTranslations("app.header");

  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5 lg:mb-8 lg:pb-6",
        active === "resume" && !showResumeHeader && "hidden",
      )}
    >
      <div className="min-w-0">
        <h1 className="text-ui-title font-semibold lg:text-ui-title-wide">{pageTitle}</h1>
        <p className="mt-1 max-w-[720px] text-ui-body text-muted-foreground">
          {pageSubtitle}
        </p>
      </div>
      {active === "pipeline" || isPending || toast ? (
        <div className="flex flex-wrap items-center gap-3">
          {isPending || toast ? (
            <p role="status" className="text-ui-meta text-muted-foreground">
              {isPending ? t("processing") : toast}
            </p>
          ) : null}
          {active === "pipeline" ? (
            <Button type="button" onClick={onAddApplication}>
              <Plus aria-hidden />
              {t("addApplication")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
