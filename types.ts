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

export type BookCondition = 'new' | 'like-new' | 'good' | 'fair';

export type BookCategory = 
  | 'engineering'
  | 'computer-science'
  | 'electronics'
  | 'mechanical'
  | 'civil'
  | 'electrical'
  | 'business'
  | 'science'
  | 'mathematics'
  | 'language'
  | 'other';

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  condition: BookCondition;
  category: BookCategory;
  semester?: number;
  description: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerRating: number;
  location: string;
  createdAt: Date;
  views: number;
  isFeatured?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  department?: string;
  semester?: number;
  rating: number;
  totalSales: number;
  joinedAt: Date;
  isVerified: boolean;
}

export interface FilterOptions {
  category?: BookCategory;
  condition?: BookCondition;
  minPrice?: number;
  maxPrice?: number;
  semester?: number;
  location?: string;
  searchQuery?: string;
}

export type TabType = 'listings' | 'sold' | 'purchased' | 'saved';

export interface ProfileData {
  full_name: string | null;
  email: string | null;
  department: string | null;
  semester: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  verification_status: string | null;
  created_at: string;
}
