"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

let confirmListeners: ((dialog: ConfirmDialog | null) => void)[] = []
let currentDialog: ConfirmDialog | null = null

interface ConfirmDialog {
  title: string
  message: string
  onConfirm: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

function notify() {
  confirmListeners.forEach((listener) => listener(currentDialog))
}

export function confirmDialog(dialog: ConfirmDialog): Promise<boolean> {
  return new Promise((resolve) => {
    currentDialog = {
      ...dialog,
      onConfirm: () => {
        dialog.onConfirm()
        currentDialog = null
        notify()
        resolve(true)
      },
      onCancel: () => {
        dialog.onCancel?.()
        currentDialog = null
        notify()
        resolve(false)
      },
    }
    notify()
  })
}

export function ConfirmDialogContainer() {
  const [dialog, setDialog] = useState<ConfirmDialog | null>(null)

  useEffect(() => {
    confirmListeners.push(setDialog)
    setDialog(currentDialog)

    return () => {
      confirmListeners = confirmListeners.filter((l) => l !== setDialog)
    }
  }, [])

  if (!dialog) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <CardTitle>{dialog.title}</CardTitle>
          </div>
          <CardDescription>{dialog.message}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={dialog.onCancel}>
            {dialog.cancelText || "Cancelar"}
          </Button>
          <Button
            variant={dialog.variant || "default"}
            onClick={dialog.onConfirm}
            className={dialog.variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {dialog.confirmText || "Confirmar"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

