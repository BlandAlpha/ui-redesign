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
  showResumeHeader = false,
  isPending,
  toast,
  onAddApplication,
}: {
  active: NavKey;
  pageTitle?: string;
  showResumeHeader?: boolean;
  isPending: boolean;
  toast: string;
  onAddApplication: () => void;
}) {
  const t = useTranslations("app.header");

  return (
    <div
      className={cn(
        "mb-5 flex flex-wrap items-center justify-between gap-4 lg:mb-7",
        active === "resume" && !showResumeHeader && "hidden",
      )}
    >
      <div className="min-w-0">
        <h1 className="text-ui-title font-semibold lg:text-ui-title-wide">{pageTitle}</h1>
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
