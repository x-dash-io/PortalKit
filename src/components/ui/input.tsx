import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border px-3 py-1 text-base shadow-[var(--shadow-soft)] transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:ring-[3px]",
        "aria-invalid:ring-[3px]",
        className
      )}
      style={{
        background: 'var(--input)',
        borderColor: 'var(--border-medium)',
        color: 'var(--text-primary)',
      }}
      {...props}
    />
  )
}

export { Input }
