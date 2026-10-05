
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  updateBookStatus,
  deleteBook,
  toggleBookFeatured,
} from "@/lib/action/book";
import { Book } from "@/db/Schemas/book";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  MapPin,
  Calendar,
  Package,
  Loader2,
  Trash2,
  User,
  Phone,
  MessageCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Images,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BooksTable({
  books,
}: {
  books: Book[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedBook, setSelectedBook] =
    useState<Book | null>(null);

  const [adminNotes, setAdminNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTogglingFeature, setIsTogglingFeature] =
    useState<string | null>(null);

  // Image gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] =
    useState(false);
  const [zoom, setZoom] = useState(1);

  const images = selectedBook?.images ?? [];
  const activeImage = images[activeImageIndex];

  const resetGallery = () => {
    setActiveImageIndex(0);
    setZoom(1);
    setIsImageViewerOpen(false);
  };

  const handleReviewBook = (book: Book) => {
    setSelectedBook(book);
    setAdminNotes("");
    resetGallery();
  };

  const closeReview = () => {
    if (isLoading) return;

    setSelectedBook(null);
    resetGallery();
  };

  const goToImage = (index: number) => {
    if (images.length === 0) return;

    const nextIndex =
      (index + images.length) % images.length;

    setActiveImageIndex(nextIndex);
    setZoom(1);
  };

  const goToPreviousImage = () => {
    goToImage(activeImageIndex - 1);
  };

  const goToNextImage = () => {
    goToImage(activeImageIndex + 1);
  };

  const handleToggleFeatured = async (book: Book) => {
    setIsTogglingFeature(book.id);

    try {
      await toggleBookFeatured(book.id, book.isFeatured);

      toast({
        title: !book.isFeatured
          ? "Added to Featured"
          : "Removed from Featured",
        description: `Book "${book.title}" is ${
          !book.isFeatured
            ? "now featured"
            : "no longer featured"
        }.`,
      });

      router.refresh();
    } catch (error) {
      console.error(error);

      toast({
        title: "Error",
        description: "Failed to update featured status.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingFeature(null);
    }
  };

  const handleStatusUpdate = async (
    bookId: string,
    status: "approved" | "rejected"
  ) => {
    setIsLoading(true);

    try {
      await updateBookStatus(bookId, status);

      toast({
        title:
          status === "approved"
            ? "Book Approved"
            : "Book Rejected",
        description: `Listing status updated to ${status}.`,
        variant:
          status === "approved"
            ? "default"
            : "destructive",
      });

      setSelectedBook(null);
      resetGallery();
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
    if (
      !confirm(
        "Are you sure you want to delete this book? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      await deleteBook(bookId);

      toast({
        title: "Book Deleted",
        description: "The listing has been permanently removed.",
      });

      setSelectedBook(null);
      resetGallery();
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
        return (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );

      case "rejected":
        return (
          <Badge className="border-red-200 bg-red-50 text-red-700">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );

      case "sold":
        return (
          <Badge className="border-blue-200 bg-blue-50 text-blue-700">
            <Package className="mr-1 h-3 w-3" />
            Sold
          </Badge>
        );

      default:
        return (
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  const canUpdateStatus =
    selectedBook !== null &&
    selectedBook.status !== "approved" &&
    selectedBook.status !== "rejected";

  return (
    <>
      {/* Existing books table */}
      <Card className="border-slate-200 shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-700">
                  Book Details
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Category
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Price
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Condition
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Status
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {books.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen className="h-12 w-12 text-slate-300" />
                      <p className="font-medium text-slate-500">
                        No books found
                      </p>
                      <p className="text-sm text-slate-400">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book) => (
                  <TableRow
                    key={book.id}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          {book.images?.[0] ? (
                            <Image
                              fill
                              src={book.images[0]}
                              alt={book.title}
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <BookOpen className="h-6 w-6 text-slate-400" />
                            </div>
                          )}

                          {book.isFeatured && (
                            <div className="absolute right-0 top-0 rounded-bl-md bg-yellow-400 p-0.5">
                              <Star className="h-3 w-3 fill-white text-white" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="line-clamp-1 font-semibold text-slate-900">
                            {book.title}
                          </p>
                          <p className="mt-0.5 text-sm text-slate-600">
                            {book.author}
                          </p>

                          {book.semester && (
                            <Badge
                              variant="outline"
                              className="mt-1 text-xs text-slate-500"
                            >
                              Semester {book.semester}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 capitalize text-slate-700"
                      >
                        {book.category.replace("-", " ")}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold text-slate-900">
                        ৳{book.price}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm capitalize text-slate-600">
                        {book.condition.replace("-", " ")}
                      </span>
                    </TableCell>

                    <TableCell>
                      {getStatusBadge(book.status)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFeatured(book)}
                          disabled={isTogglingFeature === book.id}
                          className={cn(
                            "h-8 w-8 hover:bg-yellow-50",
                            book.isFeatured
                              ? "text-yellow-500 hover:text-yellow-600"
                              : "text-slate-400 hover:text-yellow-500"
                          )}
                          title={
                            book.isFeatured
                              ? "Remove from Featured"
                              : "Add to Featured"
                          }
                        >
                          {isTogglingFeature === book.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Star
                              className={cn(
                                "h-4 w-4",
                                book.isFeatured && "fill-current"
                              )}
                            />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReviewBook(book)}
                          className="hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Eye className="mr-1.5 h-4 w-4" />
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

      {/* Redesigned review modal */}
      <Dialog
        open={!!selectedBook}
        onOpenChange={(open) => {
          if (!open) closeReview();
        }}
      >
        <DialogContent
          className="flex max-h-[92dvh] w-[calc(100%-1rem)] max-w-6xl flex-col gap-0 overflow-hidden p-0 sm:w-full"
          onInteractOutside={(event) => {
            if (isLoading) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (isLoading) event.preventDefault();
          }}
        >
          <DialogHeader className="shrink-0 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3 pr-7">
              <div className="min-w-0">
                <DialogTitle className="text-xl font-semibold">
                  Review Listing
                </DialogTitle>
                <p className="mt-1 text-sm text-slate-500">
                  Inspect book photos and verify the listing details.
                </p>
              </div>

              {selectedBook &&
                getStatusBadge(selectedBook.status)}
            </div>
          </DialogHeader>

          {selectedBook && (
            <>
              {/* Scrollable modal body */}
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  {/* Image gallery */}
                  <section className="min-w-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Book Photos
                        </h3>
                        <p className="text-xs text-slate-500">
                          Click the image to zoom and inspect details.
                        </p>
                      </div>

                      <Badge variant="outline">
                        <Images className="mr-1 h-3.5 w-3.5" />
                        {images.length}{" "}
                        {images.length === 1 ? "photo" : "photos"}
                      </Badge>
                    </div>

                    {/* Main image stage */}
                    <div className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-[380px] lg:h-[420px]">
                      {activeImage ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setIsImageViewerOpen(true)
                            }
                            className="absolute inset-0 z-0 flex cursor-zoom-in items-center justify-center p-3"
                            aria-label="Open full-size book photo"
                          >
                            <Image
                              key={activeImage}
                              src={activeImage}
                              alt={`${selectedBook.title} photo ${
                                activeImageIndex + 1
                              }`}
                              fill
                              sizes="(max-width: 1024px) 100vw, 60vw"
                              className="pointer-events-none object-contain p-2"
                            />
                          </button>

                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            onClick={() =>
                              setIsImageViewerOpen(true)
                            }
                            className="absolute bottom-3 right-3 z-10 h-9 w-9 border border-slate-200 bg-white/95 shadow-sm hover:bg-white"
                            aria-label="Zoom image"
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>

                          {images.length > 1 && (
                            <>
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                onClick={goToPreviousImage}
                                className="absolute left-3 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 shadow-sm hover:bg-white"
                                aria-label="Previous photo"
                              >
                                <ChevronLeft className="h-5 w-5" />
                              </Button>

                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                onClick={goToNextImage}
                                className="absolute right-3 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 shadow-sm hover:bg-white"
                                aria-label="Next photo"
                              >
                                <ChevronRight className="h-5 w-5" />
                              </Button>
                            </>
                          )}

                          {selectedBook.isFeatured && (
                            <Badge className="absolute left-3 top-3 z-10 border-0 bg-yellow-400 text-yellow-950 hover:bg-yellow-400">
                              <Star className="mr-1 h-3 w-3 fill-current" />
                              Featured
                            </Badge>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <BookOpen className="h-12 w-12" />
                          <p className="text-sm">No photos available</p>
                        </div>
                      )}
                    </div>

                    {/* Image counter and navigation */}
                    {images.length > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          Photo{" "}
                          <span className="font-semibold text-slate-900">
                            {activeImageIndex + 1}
                          </span>{" "}
                          of {images.length}
                        </span>

                        {images.length > 1 && (
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={goToPreviousImage}
                              className="h-8 gap-1 px-2"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={goToNextImage}
                              className="h-8 gap-1 px-2"
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Clickable thumbnail strip */}
                    {images.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((img, index) => (
                          <button
                            key={`${img}-${index}`}
                            type="button"
                            onClick={() => goToImage(index)}
                            aria-label={`View photo ${index + 1}`}
                            aria-pressed={
                              activeImageIndex === index
                            }
                            className={cn(
                              "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-slate-100 transition sm:h-20 sm:w-20",
                              activeImageIndex === index
                                ? "border-emerald-600 ring-2 ring-emerald-100"
                                : "border-slate-200 opacity-75 hover:border-slate-400 hover:opacity-100"
                            )}
                          >
                            <Image
                              src={img}
                              alt={`Thumbnail ${index + 1}`}
                              fill
                              sizes="80px"
                              className="object-contain p-1"
                            />
                            <span className="absolute bottom-0 right-0 rounded-tl bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                              {index + 1}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <p className="text-xs leading-relaxed text-slate-500">
                      Tip: Open the full-size viewer to inspect
                      small text, page condition, and damage.
                    </p>
                  </section>

                  {/* Listing details */}
                  <section className="min-w-0 space-y-4">
                    <div>
                      <h2 className="break-words text-2xl font-bold leading-tight text-slate-900">
                        {selectedBook.title}
                      </h2>
                      <p className="mt-1 text-base text-slate-600">
                        by {selectedBook.author}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 capitalize"
                      >
                        {selectedBook.category.replace("-", " ")}
                      </Badge>

                      <Badge
                        variant="outline"
                        className="capitalize"
                      >
                        {selectedBook.condition.replace("-", " ")}
                      </Badge>

                      {selectedBook.semester && (
                        <Badge variant="outline">
                          Semester {selectedBook.semester}
                        </Badge>
                      )}
                    </div>

                    {/* Seller information */}
                    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Seller Details
                        </p>

                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <User className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 space-y-2">
                            <p className="break-words font-semibold text-slate-900">
                              {selectedBook.sellerName}
                            </p>

                            {selectedBook.sellerWhatsapp && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MessageCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                                <span className="break-all font-mono">
                                  {selectedBook.sellerWhatsapp}
                                </span>
                              </div>
                            )}

                            {selectedBook.sellerPhone && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone className="h-4 w-4 shrink-0 text-blue-600" />
                                <span className="break-all font-mono">
                                  {selectedBook.sellerPhone}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-slate-200" />

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="min-w-0">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Pickup Location
                          </p>

                          <div className="flex items-start gap-2 text-sm text-slate-800">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                            <span className="break-words">
                              {selectedBook.location}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Asking Price
                          </p>
                          <p className="text-2xl font-bold text-slate-900">
                            ৳{selectedBook.price}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        Posted on{" "}
                        {new Date(
                          selectedBook.createdAt
                        ).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="mb-2 text-sm font-semibold text-slate-900">
                        Description
                      </p>
                      <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-600">
                        {selectedBook.description ||
                          "No description provided by seller."}
                      </p>
                    </div>

                    {/* Admin notes */}
                    {canUpdateStatus && (
                      <div>
                        <label
                          htmlFor="admin-review-notes"
                          className="mb-2 block text-sm font-semibold text-slate-900"
                        >
                          Admin Notes (optional)
                        </label>

                        <Textarea
                          id="admin-review-notes"
                          value={adminNotes}
                          onChange={(e) =>
                            setAdminNotes(e.target.value)
                          }
                          placeholder="Add feedback regarding the approval or rejection..."
                          rows={3}
                        />
                      </div>
                    )}
                  </section>
                </div>
              </div>

              {/* Fixed footer: moderation actions remain visible */}
              <DialogFooter className="shrink-0 flex-col gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:px-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeReview}
                  disabled={isLoading}
                  className="sm:mr-auto"
                >
                  {canUpdateStatus ? "Cancel" : "Close"}
                </Button>

                {canUpdateStatus ? (
                  <>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() =>
                        handleStatusUpdate(
                          selectedBook.id,
                          "rejected"
                        )
                      }
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Reject
                    </Button>

                    <Button
                      type="button"
                      onClick={() =>
                        handleStatusUpdate(
                          selectedBook.id,
                          "approved"
                        )
                      }
                      disabled={isLoading}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Approve
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleDelete(selectedBook.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete Book
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Independent full-size image viewer */}
      <Dialog
        open={isImageViewerOpen && !!activeImage}
        onOpenChange={(open) => {
          setIsImageViewerOpen(open);
          if (!open) setZoom(1);
        }}
      >
        <DialogContent className="flex h-[95dvh] w-[calc(100%-1rem)] max-w-7xl flex-col gap-0 overflow-hidden border-slate-700 bg-slate-950 p-0 text-white sm:w-full">
          <DialogHeader className="shrink-0 border-b border-white/10 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between gap-3 pr-7">
              <div className="min-w-0">
                <DialogTitle className="truncate text-base text-white">
                  {selectedBook?.title || "Book Photo"}
                </DialogTitle>
                <p className="mt-1 text-xs text-slate-400">
                  Photo {activeImageIndex + 1} of {images.length}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Zoom out"
                  disabled={zoom <= 1}
                  onClick={() =>
                    setZoom((current) =>
                      Math.max(1, current - 0.25)
                    )
                  }
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>

                <span className="min-w-12 text-center text-xs text-slate-300">
                  {Math.round(zoom * 100)}%
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Zoom in"
                  disabled={zoom >= 3}
                  onClick={() =>
                    setZoom((current) =>
                      Math.min(3, current + 0.25)
                    )
                  }
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Reset zoom"
                  onClick={() => setZoom(1)}
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-950 p-3 sm:p-6">
            {activeImage && (
              <div
                className="relative flex h-full w-full shrink-0 items-center justify-center"
                style={{
                  minHeight: zoom > 1 ? `${zoom * 100}%` : "100%",
                  minWidth: zoom > 1 ? `${zoom * 100}%` : "100%",
                }}
              >
                <Image
                  key={activeImage}
                  src={activeImage}
                  alt={`${selectedBook?.title || "Book"} photo ${
                    activeImageIndex + 1
                  }`}
                  width={1800}
                  height={2400}
                  unoptimized
                  className="h-auto max-h-full w-auto max-w-full object-contain transition-transform duration-150"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                />
              </div>
            )}

            {images.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={goToPreviousImage}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full shadow-lg"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={goToNextImage}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full shadow-lg"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex shrink-0 justify-center gap-2 overflow-x-auto border-t border-white/10 px-3 py-3">
              {images.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => goToImage(index)}
                  aria-label={`View photo ${index + 1}`}
                  aria-pressed={activeImageIndex === index}
                  className={cn(
                    "relative h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 bg-slate-800 sm:h-14 sm:w-14",
                    activeImageIndex === index
                      ? "border-emerald-400"
                      : "border-white/20 opacity-60 hover:opacity-100"
                  )}
                >
                  <Image
                    src={img}
                    alt={`Photo ${index + 1}`}
                    fill
                    sizes="56px"
                    className="object-contain p-0.5"
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
