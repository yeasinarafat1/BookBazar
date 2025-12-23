export interface ProfileFormData {
  full_name: string
  roll_number: string
  registration_number: string
  department: string
  shift: string
  semester: string
  phone: string
}

export interface ProfileVerificationProps {
  // Optional: Pre-fill data if editing
  initialData?: Partial<ProfileFormData>
  existingAvatar?: string | null
  verificationStatus?: "pending" | "approved" | "rejected" | null
  onSubmit: (data: {
    formData: ProfileFormData
    avatarFile: File | null
    documentFile: File | null
  }) => Promise<void>
}