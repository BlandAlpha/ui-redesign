"use client";

// Modified for TRACEFOLIO (2026): product identity and navigation.

import Image from "next/image";
import { useTranslations } from "next-intl";

import type { NavKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { navGroups } from "@/components/app/navigation";

export function AppSidebar({
  active,
  hidden,
  onNavigate,
}: {
  active: NavKey;
  hidden: boolean;
  onNavigate: (key: NavKey) => void;
}) {
  const t = useTranslations("app");

  return (
    <aside
      className={cn(
        "no-print fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex",
        hidden && "lg:hidden",
      )}
    >
      <div className="mb-8 flex items-center gap-3 px-2">
        <Image src="/brand/tracefolio-mark.svg" alt="" width={36} height={36} className="shrink-0" priority />
        <p className="text-ui-label font-semibold tracking-wide text-foreground">{t("brandName")}</p>
      </div>

      <nav aria-label={t("navGroups.workflow")} className="flex flex-1 flex-col gap-6">
        {navGroups.map((group) => (
          <div key={group.labelKey} className="flex flex-col gap-2">
            <p className="px-3 text-ui-meta font-medium text-muted-foreground">{t(`navGroups.${group.labelKey}`)}</p>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.key}
                  data-tour-nav={item.key}
                  aria-current={active === item.key ? "page" : undefined}
                  onClick={() => onNavigate(item.key)}
                  className={cn(
                    "flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-left text-ui-body font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none",
                    active === item.key
                      ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-surface-mid hover:text-foreground",
                  )}
                >
                  <Icon aria-hidden className="size-[20px] shrink-0" />
                  {t(`nav.${item.labelKey}`)}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="mt-6 border-t border-line px-2 pt-4 text-ui-meta text-muted-foreground">
        <p>{t("sidebar.localMode")}</p>
        <p>{t("sidebar.encrypted")}</p>
      </div>
    </aside>
  );
}
