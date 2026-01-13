import { User, Camera } from "lucide-react"
import Image from "next/image"

interface AvatarUploadProps {
  preview: string | null
  existing?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function AvatarUpload({ preview, existing, onChange }: AvatarUploadProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-background shadow-xl bg-muted flex items-center justify-center ring-2 ring-border/20">
          {preview || existing ? (
            <Image
              src={preview || existing || ""} 
              alt="Avatar" 
              className="h-full w-full object-cover transition-transform group-hover:scale-105" 
            />
          ) : (
            <User className="h-12 w-12 text-muted-foreground/50" />
          )}
        </div>
        <label 
          htmlFor="avatar-upload" 
          className="absolute bottom-0 right-0 p-2.5 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-all hover:scale-110 active:scale-95"
        >
          <Camera className="h-4 w-4" />
          <input 
            id="avatar-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={onChange} 
          />
        </label>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-foreground">Profile Photo</p>
        <p className="text-xs text-muted-foreground">JPG/PNG, max 2MB</p>
      </div>
    </div>
  )
}