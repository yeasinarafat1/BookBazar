"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  User, Upload, FileText, Camera, Loader2, 
  CheckCircle, AlertCircle, ArrowLeft, Clock, XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { departments, semesters, shifts } from "@/constants"
import { ProfileFormData, ProfileVerificationProps } from "@/types"
import Link from "next/link"

// --- SERVER ACTIONS ---
import { uploadImage } from "@/lib/action/upload"
import { newVerficationRequest, getVerificationRequest, reSubmitVerificationRequest } from "@/lib/action/admin" 
import { VerificationStatus } from "@/components/verification-status"
import Image from "next/image"
import { VerificationRequest } from "@/db/Schemas/ProfileVerificationRequest"

export default function ProfileVerification({
  initialData,
  existingAvatar
}: ProfileVerificationProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [currentRequest, setCurrentRequest] = useState<VerificationRequest | null>(null)
  
  // Profile data state
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentPreview, setDocumentPreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: initialData?.full_name || "",
    roll_number: initialData?.roll_number || "",
    registration_number: initialData?.registration_number || "",
    department: initialData?.department || "",
    shift: initialData?.shift || "",
    semester: initialData?.semester || "",
    phone: initialData?.phone || "",
  })

  // 1. Fetch Existing Request on Mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const request = await getVerificationRequest();
        if (request) {
          setCurrentRequest(request);
        }
      } catch (error) {
        console.error("Failed to check status", error);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkStatus();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File too large", description: "Avatar must be under 2MB", variant: "destructive" })
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Document must be under 5MB", variant: "destructive" })
        return
      }
      setDocumentFile(file)
      if (file.type.startsWith("image/")) {
        setDocumentPreview(URL.createObjectURL(file))
      } else {
        setDocumentPreview(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.roll_number || !formData.registration_number || 
        !formData.department || !formData.shift || !formData.semester) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    if (!documentFile) {
      toast({ title: "Document required", description: "Please upload your student ID", variant: "destructive" })
      return
    }

    setLoading(true)

    try {
      let finalAvatarUrl = existingAvatar; 
      if (avatarFile) {
        const res = await uploadImage(changeToFormData(avatarFile));
        if (res?.url) finalAvatarUrl = res.url;
      }

      let finalDocumentUrl = ""; 
      if (documentFile) {
        const res = await uploadImage(changeToFormData(documentFile));
        if (res?.url) finalDocumentUrl = res.url;
      }

      const submissionData = {
          ...formData,
          avatarUrl: finalAvatarUrl,
          documentUrl: finalDocumentUrl
      };

      await newVerficationRequest(submissionData);

      toast({ title: "Submitted!", description: "Request sent successfully." })
      
      // Refresh status locally instead of page reload
      const updatedRequest = await getVerificationRequest();
      setCurrentRequest(updatedRequest);
      
    } catch (error: any) {
      console.error("Error:", error)
      toast({ title: "Error", description: error.message || "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Helper for upload
  const changeToFormData = (file: File) => {
    const data = new FormData();
    data.append("file", file);
    return data;
  }

const handleResubmit = async () => {
    if (!currentRequest?.id) return;

    try {
      setLoading(true); // Optional: Show loading state during deletion
      
      // 1. Call Server Action to delete
      await reSubmitVerificationRequest(currentRequest.id);
      
      // 2. IMMEDIATE UI UPDATE: Clear the local request state
      // This forces the component to render the Form View immediately
      setCurrentRequest(null); 
      
      // 3. Clear any preview images from the previous request if needed
      // (Optional, depending on if you want them to persist or not)
      // setDocumentPreview(null);
      // setDocumentFile(null);

      // 4. Sync Next.js router cache
      router.refresh(); 
      
      toast({ title: "Ready to resubmit", description: "Please fill out the form again." });

    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to reset form", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }



  if (checkingStatus) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // 2. STATUS VIEW COMPONENT (If request exists)
  if (currentRequest) {
    const status = currentRequest.verificationStatus; // 'pending' | 'verified' | 'rejected'
    
    return (
      <VerificationStatus
        status={status as "pending" | "verified" | "rejected"}
        feedback={currentRequest.admin_feedback || ""}
        onResubmit={handleResubmit}
      />
    )
  }

  // 3. FORM VIEW (If no request exists or Resubmitting)
  return (
    <section className="min-w-full flex justify-center">
    <div className="container py-6 max-w-2xl">
      <Link href='/profile' 
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h1 className="text-2xl font-bold text-foreground mb-2">Verify Your Profile</h1>
        <p className="text-muted-foreground mb-6">
          Complete your profile and upload verification documents to become a verified seller.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
                {avatarPreview || existingAvatar ? (
                  <Image
                    src={avatarPreview || existingAvatar || ""}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div>
                <label htmlFor="avatar" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Camera className="h-4 w-4" />
                    Upload Photo
                  </div>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-1">Max 2MB, JPG or PNG</p>
              </div>
            </div>
          </div>

          {/* Student Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roll_number">Roll Number *</Label>
              <Input
                id="roll_number"
                value={formData.roll_number}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                placeholder="Your roll number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number *</Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                placeholder="Your registration number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift">Shift *</Label>
              <Select
                value={formData.shift}
                onValueChange={(value) => setFormData({ ...formData, shift: value })}
              >
                <SelectTrigger id="shift">
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  {shifts.map((shift) => (
                    <SelectItem key={shift} value={shift}>{shift}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="semester">Semester *</Label>
              <Select
                value={formData.semester}
                onValueChange={(value) => setFormData({ ...formData, semester: value })}
              >
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem}>{sem} Semester</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Verification Document */}
          <div className="space-y-2">
            <Label>Verification Document *</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Upload your student ID card or registration card to verify your identity.
            </p>
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                documentFile ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
              onClick={() => document.getElementById("document")?.click()}
            >
              {documentPreview ? (
                <Image src={documentPreview} alt="Document" className="max-h-48 mx-auto rounded-lg" />
              ) : documentFile ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-12 w-12 text-primary" />
                  <span className="text-sm font-medium text-foreground">{documentFile.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload your ID card or registration card
                  </span>
                  <span className="text-xs text-muted-foreground">Max 5MB, JPG, PNG or PDF</span>
                </div>
              )}
              <input
                id="document"
                type="file"
                accept="image/*,.pdf"
                onChange={handleDocumentChange}
                className="hidden"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Uploading & Submitting..." : "Submit for Verification"}
          </Button>
        </form>
      </div>
    </div>
    </section>
  )
}