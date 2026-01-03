"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
  Search, Eye, CheckCircle, XCircle, Clock, BookOpen, 
  MapPin, GraduationCap, ImageIcon, Calendar, 
  DollarSign, Package, Loader2
} from "lucide-react";
import { Book } from "@/db/schema";
import { updateBookStatus } from "@/lib/action/book";

export default function BooksClient({ books: initialData }: { books: Book[] }) {
  const [books, setBooks] = useState<Book[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReviewBook = (book: Book) => {
    setSelectedBook(book);
    setAdminNotes("");
  };

  const handleStatusUpdate = async (bookId: string, status: "approved" | "rejected") => {
    setIsLoading(true);
    try {
      await updateBookStatus(bookId, status);
      setBooks(books.map(b => b.id === bookId ? { ...b, status } : b));
      setSelectedBook(null);
      
      toast({
        title: status === "approved" ? "Book Approved" : "Book Rejected",
        description: `Listing status updated to ${status}.`,
        variant: status === "approved" ? "default" : "destructive",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update book status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": 
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected": 
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "sold": 
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
            <DollarSign className="w-3 h-3 mr-1" />
            Sold
          </Badge>
        );
      default: 
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || book.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: books.length,
    pending: books.filter(b => b.status === "pending").length,
    approved: books.filter(b => b.status === "approved").length,
    rejected: books.filter(b => b.status === "rejected").length,
  };

  const canUpdateStatus = selectedBook && selectedBook.status !== "approved" && selectedBook.status !== "rejected";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Book Management</h1>
            <p className="text-slate-600 mt-1">Review and manage book listings from students</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Books</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Pending</p>
                    <p className="text-2xl font-bold text-amber-800 mt-1">{stats.pending}</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Approved</p>
                    <p className="text-2xl font-bold text-emerald-800 mt-1">{stats.approved}</p>
                  </div>
                  <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Rejected</p>
                    <p className="text-2xl font-bold text-red-800 mt-1">{stats.rejected}</p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters Section */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by title or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 border-slate-200">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Section */}
        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">Book Details</TableHead>
                  <TableHead className="font-semibold text-slate-700">Category</TableHead>
                  <TableHead className="font-semibold text-slate-700">Price</TableHead>
                  <TableHead className="font-semibold text-slate-700">Condition</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <BookOpen className="h-12 w-12 text-slate-300" />
                        <p className="text-slate-500 font-medium">No books found</p>
                        <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBooks.map((book) => (
                    <TableRow key={book.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                            {book.images?.[0] ? (
                              <img src={book.images[0]} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 line-clamp-1">{book.title}</p>
                            <p className="text-sm text-slate-600 mt-0.5">{book.author}</p>
                            {book.semester && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Semester {book.semester}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize bg-blue-50 text-blue-700 border-blue-200">
                          {book.category.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-900">৳{book.price}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize bg-slate-50 text-slate-700 border-slate-300">
                          <Package className="w-3 h-3 mr-1" />
                          {book.condition.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(book.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleReviewBook(book)}
                          className="hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Review Dialog - Simple & Clean */}
        <Dialog open={!!selectedBook} onOpenChange={() => !isLoading && setSelectedBook(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Review Book Listing</DialogTitle>
                {selectedBook && getStatusBadge(selectedBook.status)}
              </div>
            </DialogHeader>
            
            {selectedBook && (
              <div className="space-y-6">
                {/* Images */}
                <div>
                  <p className="text-sm font-medium mb-3">Photos ({selectedBook.images.length})</p>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedBook.images.map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden border">
                        <img src={img} alt={`${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Book Info */}
                <div>
                  <h3 className="text-xl font-bold mb-1">{selectedBook.title}</h3>
                  <p className="text-muted-foreground mb-3">by {selectedBook.author}</p>
                  
                  <div className="flex gap-2 mb-4">
                    <Badge variant="secondary">{selectedBook.category.replace('-', ' ')}</Badge>
                    {selectedBook.semester && <Badge variant="outline">Semester {selectedBook.semester}</Badge>}
                    <Badge variant="outline">{selectedBook.condition.replace('-', ' ')}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-lg font-bold">৳{selectedBook.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">{selectedBook.location}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Posted</p>
                      <p className="text-sm">{new Date(selectedBook.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground">{selectedBook.description || "No description"}</p>
                </div>

                {/* Admin Notes - Only if pending */}
                {canUpdateStatus && (
                  <div>
                    <p className="text-sm font-medium mb-2">Admin Notes (optional)</p>
                    <Textarea 
                      value={adminNotes} 
                      onChange={(e) => setAdminNotes(e.target.value)} 
                      placeholder="Add feedback for the seller..."
                      rows={3}
                    />
                  </div>
                )}
              </div>
            )}

            {canUpdateStatus && (
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedBook(null)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => selectedBook && handleStatusUpdate(selectedBook.id, "rejected")}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Reject
                </Button>
                <Button 
                  onClick={() => selectedBook && handleStatusUpdate(selectedBook.id, "approved")}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Approve
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}