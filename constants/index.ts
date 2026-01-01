

export const departments = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electronics",
  "Architecture",
  "Other"
]
export const shifts = ["Morning", "Day", "Evening"]
export const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"]


// lib/mock-data.ts

export interface Book {
  id: string;
  title: string;
  author: string | null;
  price: number;
  original_price: number | null;
  condition: "new" | "like_new" | "good" | "fair" | "poor";
  category: string;
  status: "pending" | "approved" | "rejected" | "sold";
  images: string[];
  created_at: string;
  seller_id: string;
  description: string | null;
  department: string | null;
  semester: string | null;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  verification_status: string | null;
  created_at: string;
  roll_number: string | null;
  registration_number: string | null;
  department: string | null;
  shift: string | null;
  semester: string | null;
}

export interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  profile?: Profile;
}

// --- MOCK DATA ---

export const mockUsers: Profile[] = [
  {
    id: "1",
    user_id: "u1",
    full_name: "Alice Student",
    email: "alice@example.com",
    phone: "1234567890",
    avatar_url: "https://i.pravatar.cc/150?u=a",
    is_verified: true,
    verification_status: "approved",
    created_at: "2023-10-15T10:00:00Z",
    roll_number: "101",
    registration_number: "REG001",
    department: "Computer Science",
    shift: "Morning",
    semester: "5th"
  },
  {
    id: "2",
    user_id: "u2",
    full_name: "Bob Unverified",
    email: "bob@example.com",
    phone: "0987654321",
    avatar_url: null,
    is_verified: false,
    verification_status: "pending",
    created_at: "2023-10-20T14:30:00Z",
    roll_number: "102",
    registration_number: "REG002",
    department: "BBA",
    shift: "Day",
    semester: "2nd"
  }
];

export const mockBooks: Book[] = [
  {
    id: "b1",
    title: "Introduction to Algorithms",
    author: "Cormen",
    price: 500,
    original_price: 1200,
    condition: "good",
    category: "Engineering",
    status: "pending",
    images: ["https://placehold.co/400x600?text=Book+Cover"],
    created_at: "2023-11-01T09:00:00Z",
    seller_id: "u1",
    description: "Classic algorithms book, slightly used.",
    department: "CSE",
    semester: "4th"
  },
  {
    id: "b2",
    title: "Economics 101",
    author: "Smith",
    price: 300,
    original_price: 800,
    condition: "like_new",
    category: "Business",
    status: "approved",
    images: [],
    created_at: "2023-10-25T11:20:00Z",
    seller_id: "u2",
    description: "Mint condition.",
    department: "BBA",
    semester: "1st"
  }
];

export const mockVerifications: VerificationDocument[] = [
  {
    id: "v1",
    user_id: "u2",
    document_type: "student_id",
    document_url: "https://placehold.co/600x400?text=Student+ID",
    status: "pending",
    admin_notes: null,
    created_at: "2023-11-02T10:00:00Z",
    profile: mockUsers[1]
  },
  {
    id: "v2",
    user_id: "u1",
    document_type: "enrollment_certificate",
    document_url: "https://placehold.co/600x400?text=Certificate",
    status: "approved",
    admin_notes: "Looks good",
    created_at: "2023-10-15T10:05:00Z",
    profile: mockUsers[0]
  }
];

