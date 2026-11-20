import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function RecordCard({
  title,
  context,
  detail,
  metadata,
  actions,
  onOpen,
  heading: Heading = "h2",
}: {
  title: string;
  context?: ReactNode;
  detail?: ReactNode;
  metadata?: ReactNode;
  actions?: ReactNode;
  onOpen: () => void;
  heading?: "h2" | "h3";
}) {
  return (
    <article
      data-slot="record-card"
      className="group relative grid h-full min-w-0 grid-cols-[minmax(0,1fr)_auto] grid-rows-[44px_48px_40px_32px] gap-x-2 gap-y-1 rounded-xl border border-line bg-card px-4 pt-2 pb-3 transition-colors duration-150 hover:border-primary/45 hover:bg-brand-muted/20 motion-reduce:transition-none"
    >
      <div data-slot="record-context" className="col-start-1 row-start-1 flex min-w-0 items-center gap-2 text-ui-meta font-medium text-muted-foreground">
        {context}
      </div>
      <Heading data-slot="record-title" className="col-span-2 row-start-2 min-w-0 text-ui-label font-semibold">
        <button
          type="button"
          onClick={onOpen}
          title={title}
          className="block w-full text-left after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
        >
          <span className="line-clamp-2 [overflow-wrap:anywhere]">{title}</span>
        </button>
      </Heading>
      <div data-slot="record-detail" className="col-span-2 row-start-3 line-clamp-2 min-w-0 text-ui-meta text-muted-foreground [overflow-wrap:anywhere]">
        {detail}
      </div>
      <div data-slot="record-metadata" className="col-span-2 row-start-4 flex min-w-0 items-center justify-between gap-2 border-t border-line pt-1 text-ui-meta text-muted-foreground">
        {metadata}
      </div>
      {actions ? (
        <div data-slot="record-actions" className="relative z-10 col-start-2 row-start-1 flex items-center gap-1">
          {actions}
        </div>
      ) : null}
    </article>
  );
}

export function RecordCardAction({
  label,
  onClick,
  disabled,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-9 place-items-center rounded-lg text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-40 pointer-coarse:size-[44px] [&>svg]:size-4",
        destructive ? "hover:bg-destructive-soft hover:text-destructive" : "hover:bg-brand-muted hover:text-brand",
      )}
    >
      {children}
    </button>
  );
}
