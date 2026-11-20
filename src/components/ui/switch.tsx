"use client"

// Modified for TRACEFOLIO (2026): equal thumb insets for both switch sizes.

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex h-(--switch-height) w-(--switch-width) shrink-0 items-center rounded-full bg-input p-[2px] transition-colors duration-150 [--switch-height:20px] [--switch-width:36px] after:absolute after:inset-[-12px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:outline-2 aria-invalid:outline-destructive data-[size=sm]:[--switch-height:16px] data-[size=sm]:[--switch-width:28px] data-checked:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-[calc(var(--switch-height)-4px)] shrink-0 rounded-full bg-white transition-transform duration-150 group-data-checked/switch:translate-x-[calc(var(--switch-width)-var(--switch-height))] dark:group-data-checked/switch:bg-primary-foreground motion-reduce:transition-none rtl:group-data-checked/switch:-translate-x-[calc(var(--switch-width)-var(--switch-height))]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
