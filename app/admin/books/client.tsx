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
import { Search, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { Book } from "@/constants";

export default function BooksClient({ initialBooks }: { initialBooks: Book[] }) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();

  const handleReviewBook = (book: Book) => {
    setSelectedBook(book);
    setAdminNotes("");
  };

  const updateBookStatus = (bookId: string, status: "approved" | "rejected") => {
    // Mock Update Logic
    setBooks(books.map(b => b.id === bookId ? { ...b, status } : b));
    setSelectedBook(null);
    toast({
      title: "Book Updated",
      description: `Book has been ${status}. (Mock Action)`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-emerald-500/10 text-emerald-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected": return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "sold": return <Badge variant="secondary">Sold</Badge>;
      default: return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || book.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Book Management</h2>
          <p className="text-muted-foreground">Review and manage book listings</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{book.title}</p>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>৳{book.price}</TableCell>
                  <TableCell><Badge variant="outline">{book.condition}</Badge></TableCell>
                  <TableCell>{getStatusBadge(book.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleReviewBook(book)}>
                      <Eye className="h-4 w-4 mr-1" /> Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Review Book</DialogTitle>
            </DialogHeader>
            {selectedBook && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold">{selectedBook.title}</h3>
                    <p>{selectedBook.description}</p>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Admin Notes</label>
                        <Textarea 
                            value={adminNotes} 
                            onChange={(e) => setAdminNotes(e.target.value)} 
                            placeholder="Add notes..."
                        />
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button variant="destructive" onClick={() => selectedBook && updateBookStatus(selectedBook.id, "rejected")}>Reject</Button>
                <Button onClick={() => selectedBook && updateBookStatus(selectedBook.id, "approved")}>Approve</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}