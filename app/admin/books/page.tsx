import { getAllBooks } from "@/lib/action/book";
import SearchFilter from "../__component/SearchFilter"; 
import Header from "../__component/Header"; 
import BooksTable from "./__component/BooksTable";
import StatsSection from "../__component/StatsSection";
import { BookOpen, CheckCircle, Clock, XCircle } from "lucide-react"; // 1. Import Icons

// Helper function to filter books
const filterBooks = (books: any[], query: string, status: string) => {
  return books.filter((book) => {
    const matchesSearch =
      query === "" ||
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "all" || book.status === status;
    return matchesSearch && matchesStatus;
  });
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = params.search || "";
  const statusFilter = params.status || "all";

  const allBooks = await getAllBooks();

  // 2. Calculate Counts
  const total = allBooks.length;
  const pending = allBooks.filter((b) => b.status === "pending").length;
  const approved = allBooks.filter((b) => b.status === "approved").length;
  const rejected = allBooks.filter((b) => b.status === "rejected").length;

  // 3. Create the Config Array (Data + UI Config)
  const statsItems = [
    {
      title: "Total Books",
      count: total,
      Icon: BookOpen,
      variant: "default" as const, // 'as const' ensures TypeScript treats this as the specific literal type
    },
    {
      title: "Pending",
      count: pending,
      Icon: Clock,
      variant: "pending" as const,
    },
    {
      title: "Approved",
      count: approved,
      Icon: CheckCircle,
      variant: "approved" as const,
    },
    {
      title: "Rejected",
      count: rejected,
      Icon: XCircle,
      variant: "rejected" as const,
    },
  ];

  const filteredBooks = filterBooks(allBooks, searchQuery, statusFilter);
const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="space-y-4">
          <Header 
            title="Book Management" 
            subtitle="Review and manage book listings from students" 
          />
          
          {/* 4. Pass the mapped items array */}
          <StatsSection items={statsItems} />

          <SearchFilter status={statusOptions} />
        </div>

        <BooksTable books={filteredBooks} />
        
      </div>
    </div>
  );
}