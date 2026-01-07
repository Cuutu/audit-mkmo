"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Upload, X, File, Loader2 } from "lucide-react"
import { formatFileSize } from "@/lib/utils"

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  accept?: Record<string, string[]>
  maxSize?: number
  disabled?: boolean
  obraId?: string
  procesoId?: string
}

export function FileUpload({
  onUpload,
  accept = {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
  },
  maxSize = 10 * 1024 * 1024, // 10MB por defecto
  disabled = false,
  obraId,
  procesoId,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setSelectedFile(file)
      setError(null)
      setUploading(true)

      try {
        await onUpload(file)
        setSelectedFile(null)
      } catch (err: any) {
        setError(err.message || "Error al subir el archivo")
      } finally {
        setUploading(false)
      }
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    disabled: disabled || uploading,
    multiple: false,
  })

  const handleRemove = () => {
    setSelectedFile(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-primary bg-primary/5 dark:bg-primary/10"
              : "border-border hover:border-primary/50"
          }
          ${disabled || uploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-primary font-medium">Suelta el archivo aquí...</p>
        ) : (
          <div>
            <p className="text-sm text-foreground mb-2">
              Arrastra un archivo aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, Word, Excel, imágenes (máx. {formatFileSize(maxSize)})
            </p>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-3">
            <File className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          {!uploading && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Subiendo archivo...</span>
        </div>
      )}

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 dark:bg-destructive/20 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
}

