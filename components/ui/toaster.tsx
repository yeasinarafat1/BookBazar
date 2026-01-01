"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3">
              {/* Icon Logic */}
              <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                {variant === "destructive" && (
                  <AlertCircle className="h-5 w-5" />
                )}
                {variant === "success" && (
                  <CheckCircle2 className="h-5 w-5" />
                )}
                {(variant === "default" || !variant) && (
                   <Info className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}