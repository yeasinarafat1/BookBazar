import { Upload, FileText, ShieldCheck } from "lucide-react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface DocumentUploadProps {
  file: File | null
  preview: string | null
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function DocumentUpload({ file, preview, onChange }: DocumentUploadProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">
          Verification Document <span className="text-red-500">*</span>
        </Label>
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
      </div>
      
      <label 
        className={cn(
          "flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden group",
          file 
            ? "border-primary/50 bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
        )}
      >
        {preview ? (
          <img src={preview} alt="Doc Preview" className="h-full w-full object-contain p-4" />
        ) : file ? (
          <div className="flex flex-col items-center p-4 animate-in fade-in zoom-in-95">
            <div className="p-4 bg-primary/10 rounded-full mb-3">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground max-w-[200px] truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center p-4 text-center group-hover:-translate-y-1 transition-transform duration-200">
            <div className="p-3 bg-muted rounded-full mb-3 group-hover:bg-background shadow-sm">
              <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm font-medium text-foreground">Click or drag to upload ID</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG or PNG (Max 5MB)</p>
          </div>
        )}
        <input type="file" accept="image/*,.pdf" className="hidden" onChange={onChange} />
      </label>
    </div>
  )
}