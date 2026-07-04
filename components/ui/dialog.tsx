import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

interface DialogContextType {
  onOpenChange?: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextType>({})

const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
  if (!open) return null
  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-warm-950/80 backdrop-blur-sm" onClick={() => onOpenChange?.(false)} />
        <div className="relative z-50">{children}</div>
      </div>
    </DialogContext.Provider>
  )
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DialogContext)
  
  return (
    <div
      ref={ref}
      className={cn(
        "surface-panel fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 p-6 duration-200",
        className
      )}
      {...props}
    >
      {children}
      <button
        onClick={() => onOpenChange?.(false)}
        className="absolute right-4 top-4 rounded-full p-1 text-warm-600 opacity-70 transition-opacity hover:bg-coral-500/10 hover:text-warm-900 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none dark:text-warm-400 dark:hover:text-warm-50"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

export { Dialog, DialogContent, DialogHeader, DialogTitle }
