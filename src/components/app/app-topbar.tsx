"use client";

// Modified for TRACEFOLIO (2026): responsive branded navigation and toolbar.

import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Bell, ChevronDown, CircleHelp } from "lucide-react";
import { useTranslations } from "next-intl";

import { HeaderIconButton, HeaderMenuPanel, type HeaderMenuKey } from "@/components/app/header-menu";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { navItems } from "@/components/app/navigation";
import type { ApplicationView, JobView } from "@/components/app/types";
import { buildDashboardSummary } from "@/lib/dashboard";
import type { NavKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AppTopbar({
  active,
  hidden,
  headerMenu,
  setHeaderMenu,
  followUpReminders,
  dashboard,
  resumeVersionCount,
  provider,
  onNavigate,
  onStartTour,
}: {
  active: NavKey;
  hidden: boolean;
  headerMenu: HeaderMenuKey | null;
  setHeaderMenu: Dispatch<SetStateAction<HeaderMenuKey | null>>;
  followUpReminders: Array<{ application: ApplicationView; job?: JobView; dueDate: string | null }>;
  dashboard: ReturnType<typeof buildDashboardSummary>;
  resumeVersionCount: number;
  provider: string;
  onNavigate: (key: NavKey) => void;
  onStartTour: () => void;
}) {
  const t = useTranslations("app");

  return (
    <header
      className={cn(
        "no-print sticky top-0 z-20 border-b border-line bg-surface px-4 py-2 sm:px-6 lg:ml-64 lg:px-8",
        hidden && "hidden",
      )}
    >
      <div className="flex min-h-[44px] items-center justify-between gap-2 lg:justify-end">
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <div className="flex items-center gap-2">
            <Image src="/brand/tracefolio-mark.svg" alt="" width={28} height={28} className="shrink-0" priority />
            <span className="hidden font-sans text-base font-semibold text-foreground sm:inline">{t("brandName")}</span>
          </div>
          <div className="relative min-w-0">
            <select
              data-tour-mobile-nav
              aria-label={t("navGroups.workflow")}
              className="h-[44px] max-w-full appearance-none truncate rounded-lg border border-line bg-surface-low py-1 pr-7 pl-2 text-ui-body font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              value={active}
              onChange={(event) => onNavigate(event.target.value as NavKey)}
            >
              {navItems.map((item) => (
                <option key={item.key} value={item.key}>
                  {t(`nav.${item.labelKey}`)}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div className="relative flex shrink-0 items-center gap-1 text-foreground sm:gap-2">
          <LanguageSwitcher compact />
          <div className="hidden sm:block">
            <HeaderIconButton label={t("topbar.guide")} active={false} onClick={onStartTour}>
              <CircleHelp className="h-5 w-5" />
            </HeaderIconButton>
          </div>
          <HeaderIconButton
            label={t("topbar.notifications")}
            active={headerMenu === "notifications"}
            onClick={() => setHeaderMenu((current) => (current === "notifications" ? null : "notifications"))}
          >
            <Bell className="h-5 w-5" />
            {followUpReminders.length > 0 && (
              <span aria-hidden className="absolute top-2 right-2 size-1.5 rounded-full bg-destructive" />
            )}
          </HeaderIconButton>
          <a
            href="https://github.com/yiyu0716/TRACEFOLIO"
            target="_blank"
            rel="noreferrer"
            className="hidden h-8 w-8 place-items-center rounded-lg transition hover:bg-surface-low sm:grid"
            aria-label="GitHub"
            title="GitHub"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
              <path d="M12 .7A11.5 11.5 0 0 0 8.4 23c.6.1.8-.3.8-.6v-2.2c-3.4.7-4.1-1.4-4.1-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.6.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0C14.7 4 16 4 16 4c.6 1.5.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.8 5.4-5.5 5.7.4.4.8 1.1.8 2.2v4.3c0 .4.2.7.8.6A11.5 11.5 0 0 0 12 .7Z" />
            </svg>
          </a>
          <button
            type="button"
            onClick={() => setHeaderMenu((current) => (current === "profile" ? null : "profile"))}
            className={cn(
              "grid size-[44px] place-items-center rounded-full bg-brand-muted text-ui-meta font-semibold text-brand transition-colors duration-150 hover:bg-surface-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:size-9",
              headerMenu === "profile" && "ring-2 ring-primary/20",
            )}
            aria-label={t("topbar.profile")}
          >
            T
          </button>
          {headerMenu && (
            <HeaderMenuPanel
              menu={headerMenu}
              reminders={followUpReminders}
              dashboard={dashboard}
              resumeVersionCount={resumeVersionCount}
              provider={provider}
              onNavigate={(key) => {
                onNavigate(key);
                setHeaderMenu(null);
              }}
              onClose={() => setHeaderMenu(null)}
              onStartTour={onStartTour}
            />
          )}
        </div>
      </div>
    </header>
  );
}
