"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Add toggleBookFeatured to imports
import { updateBookStatus, deleteBook, toggleBookFeatured } from "@/lib/action/book";
import { Book } from "@/db/Schemas/book";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Eye, CheckCircle, XCircle, Clock, BookOpen, 
  MapPin, Calendar, Package, Loader2, Trash2,
  User, Phone, MessageCircle, Star // Added Star icon
} from "lucide-react";
import { cn } from "@/lib/utils"; // Make sure you have this utility

export default function BooksTable({ books }: { books: Book[] }) {
  const router = useRouter();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTogglingFeature, setIsTogglingFeature] = useState<string | null>(null); // Track which book is toggling
  const { toast } = useToast();

  const handleReviewBook = (book: Book) => {
    setSelectedBook(book);
    setAdminNotes("");
  };

  // --- NEW: Handle Featured Toggle ---
  const handleToggleFeatured = async (book: Book) => {
    setIsTogglingFeature(book.id);
    try {
      await toggleBookFeatured(book.id, book.isFeatured);
      
      toast({
        title: !book.isFeatured ? "Added to Featured" : "Removed from Featured",
        description: `Book "${book.title}" is ${!book.isFeatured ? "now featured" : "no longer featured"}.`,
        variant: "default",
      });
      
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update featured status.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingFeature(null);
    }
  };

  const handleStatusUpdate = async (bookId: string, status: "approved" | "rejected") => {
    setIsLoading(true);
    try {
      await updateBookStatus(bookId, status);
      
      toast({
        title: status === "approved" ? "Book Approved" : "Book Rejected",
        description: `Listing status updated to ${status}.`,
        variant: status === "approved" ? "default" : "destructive",
      });
      
      setSelectedBook(null);
      router.refresh(); 
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update book status.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book? This action cannot be undone.")) return;

    setIsLoading(true);
    try {
      await deleteBook(bookId);
      
      toast({
        title: "Book Deleted",
        description: "The listing has been permanently removed.",
        variant: "default",
      });
      
      setSelectedBook(null);
      router.refresh();
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete book.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": 
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected": 
        return <Badge className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "sold": 
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200"><Package className="w-3 h-3 mr-1" />Sold</Badge>;
      default: 
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const canUpdateStatus = selectedBook && selectedBook.status !== "approved" && selectedBook.status !== "rejected";

  return (
    <>
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
              {books.length === 0 ? (
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
                books.map((book) => (
                  <TableRow key={book.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative">
                          {book.images?.[0] ? (
                            <img src={book.images[0]} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-slate-400" />
                            </div>
                          )}
                          {/* Small indicator on image if featured */}
                          {book.isFeatured && (
                            <div className="absolute top-0 right-0 bg-yellow-400 p-0.5 rounded-bl-md">
                                <Star className="h-3 w-3 text-white fill-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 line-clamp-1">{book.title}</p>
                          <p className="text-sm text-slate-600 mt-0.5">{book.author}</p>
                          {book.semester && (
                            <Badge variant="outline" className="mt-1 text-xs text-slate-500">
                              Semester {book.semester}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize bg-slate-100 text-slate-700">
                        {book.category.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-900">৳{book.price}</span>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-sm text-slate-600">{book.condition.replace('-', ' ')}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(book.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* FEATURE TOGGLE BUTTON */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFeatured(book)}
                          disabled={isTogglingFeature === book.id}
                          className={cn(
                            "h-8 w-8 hover:bg-yellow-50",
                            book.isFeatured ? "text-yellow-500 hover:text-yellow-600" : "text-slate-400 hover:text-yellow-500"
                          )}
                          title={book.isFeatured ? "Remove from Featured" : "Add to Featured"}
                        >
                          {isTogglingFeature === book.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Star className={cn("h-4 w-4", book.isFeatured && "fill-current")} />
                          )}
                        </Button>

                        {/* REVIEW BUTTON */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleReviewBook(book)}
                          className="hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedBook} onOpenChange={() => !isLoading && setSelectedBook(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between mr-8">
              <DialogTitle className="text-xl">Review Listing</DialogTitle>
              {selectedBook && getStatusBadge(selectedBook.status)}
            </div>
          </DialogHeader>
          
          {selectedBook && (
            <div className="space-y-6">
              {/* Top Section: Images & Main Info */}
              <div className="grid md:grid-cols-2 gap-6">
                 {/* Images */}
                <div className="space-y-3">
                    <div className="aspect-video rounded-lg overflow-hidden border bg-slate-50 relative">
                        {selectedBook.images?.[0] ? (
                            <img src={selectedBook.images[0]} alt="Cover" className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                        )}
                        {/* Featured Badge in Dialog */}
                        {selectedBook.isFeatured && (
                            <div className="absolute top-2 right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                                <Star className="h-3 w-3 fill-white" /> Featured
                            </div>
                        )}
                    </div>
                    {selectedBook.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {selectedBook.images.map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-md overflow-hidden border cursor-pointer hover:opacity-80">
                                <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Column */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900">{selectedBook.title}</h3>
                        <p className="text-lg text-slate-600">by {selectedBook.author}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-slate-100">{selectedBook.category}</Badge>
                        <Badge variant="outline" className="border-slate-300">{selectedBook.condition}</Badge>
                        {selectedBook.semester && <Badge variant="outline">Sem: {selectedBook.semester}</Badge>}
                    </div>

                    {/* --- Seller & Location Card --- */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                        {/* Seller Info */}
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Seller Details</p>
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{selectedBook.sellerName}</p>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                                            <span className="font-mono">{selectedBook.sellerWhatsapp}</span>
                                        </div>
                                        {selectedBook.sellerPhone && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Phone className="h-3.5 w-3.5 text-blue-600" />
                                                <span className="font-mono">{selectedBook.sellerPhone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-200 w-full"></div>

                        {/* Location & Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Pickup Location</p>
                                <div className="flex items-center gap-1.5 text-slate-900">
                                    <MapPin className="h-4 w-4 text-red-500" />
                                    <span className="text-sm font-medium">{selectedBook.location}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Price</p>
                                <div className="text-lg font-bold text-slate-900">৳{selectedBook.price}</div>
                            </div>
                        </div>
                         {/* Posted Date */}
                         <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2">
                            <Calendar className="h-3 w-3" />
                            Posted on {new Date(selectedBook.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                <p className="text-sm font-semibold text-slate-900 mb-2">Description</p>
                <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                    {selectedBook.description || "No description provided by seller."}
                </p>
              </div>

              {/* Admin Notes */}
              {canUpdateStatus && (
                <div>
                  <p className="text-sm font-medium mb-2">Admin Notes (optional)</p>
                  <Textarea 
                    value={adminNotes} 
                    onChange={(e) => setAdminNotes(e.target.value)} 
                    placeholder="Add feedback regarding the approval or rejection..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          {/* Dialog Footer */}
          {selectedBook && (
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setSelectedBook(null)} disabled={isLoading}>
                {canUpdateStatus ? "Cancel" : "Close"}
              </Button>
              
              {canUpdateStatus ? (
                <>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleStatusUpdate(selectedBook.id, "rejected")}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Reject
                  </Button>
                  <Button 
                    onClick={() => handleStatusUpdate(selectedBook.id, "approved")}
                    disabled={isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Approve
                  </Button>
                </>
              ) : (
                <Button 
                  variant="destructive" 
                  onClick={() => handleDelete(selectedBook.id)}
                  disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Delete Book
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}