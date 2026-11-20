import type { ComponentProps } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchInput({
  className,
  clear,
  ...props
}: Omit<ComponentProps<typeof Input>, "type"> & {
  "aria-label": string;
  clear?: { label: string; onClick: () => void };
}) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        {...props}
        type="search"
        className={cn("h-ui-field pl-9", clear && "pr-10 [&::-webkit-search-cancel-button]:hidden")}
      />
      {clear ? (
        <button type="button" aria-label={clear.label} onClick={clear.onClick} className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
          <X aria-hidden className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
