"use client";

// Modified for TRACEFOLIO (2026): shared workspace layout and title hierarchy.

import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import type { NavKey } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

export function WorkspaceHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header data-slot="workspace-heading" className="flex min-h-ui-field flex-wrap items-center justify-between gap-x-ui-block gap-y-ui-control">
      <h1 className="min-w-0 text-ui-title font-semibold lg:text-ui-title-wide">{title}</h1>
      {children}
    </header>
  );
}

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
  if (active === "resume" && !showResumeHeader) return null;

  return (
    <WorkspaceHeading title={pageTitle ?? ""}>
      {active === "pipeline" || isPending || toast ? (
        <div className="flex flex-wrap items-center gap-ui-control">
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
    </WorkspaceHeading>
  );
}
