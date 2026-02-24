"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, X, AlertTriangle, Loader2, Check, Search } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// --- Import Server Actions ---
import { searchUsers, searchBooks, submitReport } from "@/lib/action/report";

// --- Types ---
interface Option {
  id: string;
  label: string;
  image?: string | null;
  subLabel?: string;
}

// --- Searchable Multi-Select Component ---
const SearchableMultiSelect = ({
  placeholder,
  onSearch,
  selectedItems,
  onSelect,
  onRemove,
}: {
  placeholder: string;
  onSearch: (query: string) => Promise<Option[]>;
  selectedItems: Option[];
  onSelect: (item: Option) => void;
  onRemove: (id: string) => void;
}) => {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setOptions([]);
        return;
      }
      setLoading(true);
      try {
        const results = await onSearch(query);
        setOptions(results);
        setShowDropdown(true);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="space-y-3">
      {/* Selected Items Pills */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full text-sm border border-emerald-200 text-emerald-800 transition-all hover:bg-emerald-100"
            >
              {item.image ? (
                <div className="h-5 w-5 rounded-full overflow-hidden relative border border-emerald-200">
                  <Image src={item.image} alt={item.label} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full bg-emerald-200 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                  {item.label[0]}
                </div>
              )}
              <span className="truncate max-w-[150px] font-medium">{item.label}</span>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className={cn(
            "pl-10 h-11 transition-all",
            "focus-visible:ring-emerald-500 focus-visible:border-emerald-500",
            query.length > 0 && "border-emerald-500"
          )}
        />

        {/* Dropdown Results */}
        {showDropdown && (options.length > 0 || loading) && (
          <div className="absolute z-50 w-full mt-2 bg-white text-popover-foreground rounded-xl border border-gray-100 shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
            {loading ? (
              <div className="p-4 text-center text-xs text-muted-foreground flex justify-center gap-2 items-center">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> Searching...
              </div>
            ) : (
              <div className="p-1.5">
                {options.map((option) => {
                  const isSelected = selectedItems.some((i) => i.id === option.id);
                  return (
                    <div
                      key={option.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors group",
                        isSelected 
                          ? "bg-emerald-50" 
                          : "hover:bg-gray-50"
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (!isSelected) {
                          onSelect(option);
                          setQuery("");
                          setShowDropdown(false);
                        }
                      }}
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200 flex-shrink-0">
                          {option.image ? (
                            <Image src={option.image} alt={option.label} fill className="object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm font-bold bg-gray-50">
                              {option.label[0]}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col overflow-hidden">
                        <span className={cn(
                          "text-sm font-medium truncate",
                          isSelected ? "text-emerald-900" : "text-gray-900"
                        )}>
                          {option.label}
                        </span>
                        {option.subLabel && (
                          <span className="text-xs text-muted-foreground truncate">
                            {option.subLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function ReportPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [reportType, setReportType] = useState<string>("");
  const [reason, setReason] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selection State
  const [selectedUsers, setSelectedUsers] = useState<Option[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<Option[]>([]);

  // Search Wrappers
  const handleUserSearch = useCallback(async (query: string) => {
    const users = await searchUsers(query);
    return users.map((u) => ({
      id: u.id,
      label: u.name || u.username || "Unknown",
      subLabel: `@${u.username}`,
      image: u.profile_pic,
    }));
  }, []);

  const handleBookSearch = useCallback(async (query: string) => {
    const books = await searchBooks(query);
    return books.map((b) => ({
      id: b.id,
      label: b.title,
      subLabel: "Book", 
      image: b.cover_pic,
    }));
  }, []);

  // Image Handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imageFiles.length + files.length > 5) {
      toast({
        title: "Limit Exceeded",
        description: "You can only upload up to 5 images.",
        variant: "destructive",
      });
      return;
    }

    const newFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    if (newFiles.length !== files.length) {
        toast({ title: "File too large", description: "Some files were skipped because they exceed 5MB.", variant: "destructive" });
    }

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation
    if (!reportType) return toast({ title: "Error", description: "Please select a report type.", variant: "destructive" });
    if (!reason.trim()) return toast({ title: "Error", description: "Please enter a reason.", variant: "destructive" });
    if (reportType === 'user' && selectedUsers.length === 0) return toast({ title: "Error", description: "Select at least one user.", variant: "destructive" });
    if (reportType === 'book' && selectedBooks.length === 0) return toast({ title: "Error", description: "Select at least one book.", variant: "destructive" });

    setIsSubmitting(true);

    try {
        // 2. Construct FormData
        const formData = new FormData();
        formData.append("type", reportType);
        formData.append("reason", reason);
        
        // Add Target IDs as JSON Strings
        if (reportType === "user") {
            formData.append("targetUserIds", JSON.stringify(selectedUsers.map(u => u.id)));
        } else if (reportType === "book") {
            formData.append("targetBookIds", JSON.stringify(selectedBooks.map(b => b.id)));
        }

        // Add Images
        imageFiles.forEach((file) => {
            formData.append("images", file);
        });

        // 3. Call Server Action
        const result = await submitReport(formData);

        if (result.success) {
            toast({ 
                title: "Report Submitted", 
                description: "We have received your report and will review it shortly.",
                className: "bg-emerald-50 border-emerald-200 text-emerald-800"
            });
            setReportType("");
            setReason("");
            setSelectedUsers([]);
            setSelectedBooks([]);
            setImageFiles([]);
            
            // Clear image previews cleanly
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
            setImagePreviews([]);
        } else {
            toast({ 
                title: "Submission Failed", 
                description: result.message, 
                variant: "destructive" 
            });
        }

    } catch (error) {
        console.error(error);
        toast({ title: "System Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 hover:bg-gray-100"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Submit a Report</CardTitle>
                <CardDescription>
                  Report inappropriate content, users, or other issues.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Report Type */}
              <div className="space-y-2">
                <Label>What do you want to report?</Label>
                <Select
                  value={reportType}
                  onValueChange={(val) => {
                    setReportType(val);
                    setSelectedUsers([]);
                    setSelectedBooks([]);
                  }}
                >
                  <SelectTrigger className="h-12 focus:ring-emerald-500">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Report User(s)</SelectItem>
                    <SelectItem value="book">Report Book(s)</SelectItem>
                    <SelectItem value="other">Other Issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic Selects */}
              {reportType === "user" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label>Select User(s) to Report</Label>
                  <SearchableMultiSelect
                    placeholder="Search users by name..."
                    onSearch={handleUserSearch}
                    selectedItems={selectedUsers}
                    onSelect={(user) => {
                        if(!selectedUsers.find(u => u.id === user.id)) {
                            setSelectedUsers([...selectedUsers, user]);
                        }
                    }}
                    onRemove={(id) => setSelectedUsers(selectedUsers.filter(u => u.id !== id))}
                  />
                </div>
              )}

              {reportType === "book" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label>Select Book(s) to Report</Label>
                  <SearchableMultiSelect
                    placeholder="Search books by title..."
                    onSearch={handleBookSearch}
                    selectedItems={selectedBooks}
                    onSelect={(book) => {
                        if(!selectedBooks.find(b => b.id === book.id)) {
                            setSelectedBooks([...selectedBooks, book]);
                        }
                    }}
                    onRemove={(id) => setSelectedBooks(selectedBooks.filter(b => b.id !== id))}
                  />
                </div>
              )}

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Report</Label>
                <Textarea
                  id="reason"
                  placeholder="Please describe the issue in detail..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[120px] resize-none focus-visible:ring-emerald-500"
                />
              </div>

              {/* Evidence Upload */}
              <div className="space-y-3">
                <Label>Upload Evidence (Optional)</Label>
                
                {imagePreviews.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="relative h-24 w-24 flex-shrink-0 group rounded-lg border overflow-hidden shadow-sm">
                        <Image src={src} alt="preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {imagePreviews.length < 5 && (
                    <label className="border-2 border-dashed border-border hover:border-emerald-500/50 hover:bg-emerald-50/10 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        <div className="bg-background p-3 rounded-full shadow-sm mb-3 group-hover:text-emerald-600 transition-colors">
                            <Upload className="h-6 w-6 text-muted-foreground group-hover:text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium group-hover:text-emerald-700">Click to upload images</p>
                        <p className="text-xs text-muted-foreground mt-1">Max 5 images (5MB each)</p>
                    </label>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-[0.99]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" /> 
                        <span>Submitting...</span>
                    </div>
                ) : (
                    "Submit Report"
                )}
              </Button>

            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}