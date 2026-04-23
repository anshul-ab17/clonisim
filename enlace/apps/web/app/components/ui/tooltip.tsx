"use client";

import * as RadixTooltip from "@radix-ui/react-tooltip";
import { type ReactNode } from "react";

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <RadixTooltip.Provider delayDuration={400}>{children}</RadixTooltip.Provider>;
}

export function Tooltip({ children, label }: { children: ReactNode; label: string }) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          className="bg-[#111] text-white text-xs px-2 py-1 rounded-md border border-border-subtle shadow-lg z-50"
          sideOffset={4}
        >
          {label}
          <RadixTooltip.Arrow className="fill-[#111]" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
