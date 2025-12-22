"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle, Info, X } from "lucide-react"

interface ConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined)

export function useConfirmation() {
  const context = useContext(ConfirmationContext)
  if (!context) {
    throw new Error("useConfirmation must be used within a ConfirmationProvider")
  }
  return context
}

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean
  resolve: (value: boolean) => void
}

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
    resolve: () => {},
  })

  const confirm = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        ...options,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "default",
        resolve,
      })
    })
  }, [])

  const handleConfirm = () => {
    state.resolve(true)
    setState((prev) => ({ ...prev, isOpen: false }))
  }

  const handleCancel = () => {
    state.resolve(false)
    setState((prev) => ({ ...prev, isOpen: false }))
  }

  const getIcon = () => {
    switch (state.variant) {
      case "destructive":
        return <AlertTriangle className="w-12 h-12 text-destructive" />
      default:
        return <Info className="w-12 h-12 text-primary" />
    }
  }

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      {state.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <Card className="w-full max-w-md border-border shadow-2xl animate-scaleIn">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{state.title}</h2>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0 rounded-full hover:bg-muted hover-lift"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-col items-center text-center gap-4 my-6">
                <div className="animate-pulse">{getIcon()}</div>
                <p className="text-muted-foreground leading-relaxed">{state.message}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent hover-lift">
                  {state.cancelText}
                </Button>
                <Button variant={state.variant} onClick={handleConfirm} className="flex-1 hover-lift">
                  {state.confirmText}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </ConfirmationContext.Provider>
  )
}

export default ConfirmationProvider
