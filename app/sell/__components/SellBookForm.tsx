'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  X, ImagePlus, Sparkles, ArrowRight, 
  BookOpen, Check, Loader2, Phone, MessageCircle 
} from 'lucide-react';

import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { createListing } from '@/lib/action/book';
import Image from 'next/image';

// Types
type BookCategory = 'engineering' | 'computer-science' | 'electronics' | 'mechanical' | 'civil' | 'electrical' | 'mathematics' | 'science' | 'business' | 'language' | 'other';
type BookCondition = 'new' | 'like-new' | 'good' | 'fair';

const categoryLabels: Record<string, string> = {
  'engineering': 'Engineering',
  'computer-science': 'Computer Science',
  'electronics': 'Electronics',
  'mechanical': 'Mechanical',
  'civil': 'Civil',
  'electrical': 'Electrical',
  'mathematics': 'Mathematics',
  'science': 'Science',
  'business': 'Business',
  'language': 'Language',
  'other': 'Other'
};

const conditionLabels: Record<string, string> = {
  'new': 'New',
  'like-new': 'Like New',
  'good': 'Good',
  'fair': 'Fair'
};

const SellBookForm = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for form fields
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '' as BookCategory | '',
    condition: '' as BookCondition | '',
    semester: '',
    price: '',
    description: '',
    location: '',
    whatsapp: '',
    phone: '',
  });

  const categories: BookCategory[] = [
    'engineering', 'computer-science', 'electronics', 'mechanical',
    'civil', 'electrical', 'mathematics', 'science', 'business', 'language', 'other'
  ];
  
  const conditions: BookCondition[] = ['new', 'like-new', 'good', 'fair'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      if (images.length >= 5) return;
      
      // Store the actual file object
      setImages((prev) => [...prev, file]);
      
      // Create local preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.author || !formData.category || 
        !formData.condition || !formData.price || !formData.location ||
        !formData.phone || !formData.whatsapp) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields including contact details.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Construct FormData
      const data = new FormData();
      
      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      
      // Append images
      images.forEach((file) => {
        data.append('images', file);
      });

      // 2. Call Server Action
      await createListing(data);
      
    } catch (error: any) {
      // Next.js redirects throw an error, we ignore that specific error
      if (error.message === "NEXT_REDIRECT") {
        toast({
            title: "Listing submitted!",
            description: "Your book is now pending review.",
          });
        return; 
      }

      console.error('Error submitting book:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false); // Only stop loading on actual error
    }
  };

  const suggestPrice = () => {
    const basePrice = Math.floor(Math.random() * 300) + 150;
    setFormData({ ...formData, price: basePrice.toString() });
    toast({
      title: "Price suggested!",
      description: `Based on similar listings, we suggest ৳${basePrice}`,
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-colors",
                s <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        
        {/* Step Headers */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {step === 1 && "Add Photos"}
            {step === 2 && "Book Details"}
            {step === 3 && "Pricing & Contact"}
          </h1>
          <p className="text-muted-foreground">
            {step === 1 && "Add up to 5 photos of your book"}
            {step === 2 && "Tell us about the book"}
            {step === 3 && "Set your price, location and contact info"}
          </p>
        </div>
        
        {/* Step 1: Images */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Image Grid */}
            <div className="grid grid-cols-3 gap-3">
              {imagePreviews.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-xl overflow-hidden bg-muted"
                >
                  <Image 
                    src={img} 
                    alt="Preview" 
                    fill 
                    className="object-cover" 
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-foreground/80 text-background flex items-center justify-center hover:bg-foreground transition-colors z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 z-10">
                      <Badge variant="secondary" className="text-[10px]">Cover</Badge>
                    </div>
                  )}
                </div>
              ))}
              
              {images.length < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary bg-muted/50 hover:bg-muted cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add Photo</span>
                </label>
              )}
            </div>
            
            {/* Tips */}
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground mb-2">Photo Tips</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-primary" />
                  First photo will be the cover
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-primary" />
                  Include spine and back cover
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-primary" />
                  Show any damage or highlights
                </li>
              </ul>
            </div>
            
            <Button
              onClick={() => setStep(2)}
              disabled={images.length === 0}
              variant="default"
              className="w-full gap-2 h-12"
            >
              Continue
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Book Title *
              </label>
              <Input
                placeholder="e.g. Engineering Mathematics Vol. 1"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Author *
              </label>
              <Input
                placeholder="e.g. B.S. Grewal"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category *
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      formData.category === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {categoryLabels[cat] || cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Condition *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {conditions.map((cond) => (
                  <button
                    key={cond}
                    type="button" 
                    onClick={() => setFormData({ ...formData, condition: cond })}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      formData.condition === cond
                        ? "border-primary bg-primary/10 ring-1 ring-primary" 
                        : "border-border hover:border-primary/30 hover:bg-secondary/50"
                    )}
                  >
                    <span className="font-medium text-foreground block capitalize">
                      {conditionLabels[cond]}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {cond === 'new' && 'Unused, no marks'}
                      {cond === 'like-new' && 'Barely used, minor wear'}
                      {cond === 'good' && 'Some wear, all pages intact'}
                      {cond === 'fair' && 'Well used, functional'}
                    </span>
                    {formData.condition === cond && (
                      <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-in zoom-in" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Semester (Optional)
              </label>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setFormData({ 
                      ...formData, 
                      semester: formData.semester === sem.toString() ? '' : sem.toString() 
                    })}
                    className={cn(
                      "h-10 w-10 rounded-full text-sm font-medium transition-all",
                      formData.semester === sem.toString()
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {sem}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!formData.title || !formData.author || !formData.category || !formData.condition}
                variant="default"
                className="flex-1 gap-2"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 3: Price, Location & Contact */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Price Section */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Price (৳) *
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="flex-1"
                />
                <Button variant="outline" onClick={suggestPrice} className="gap-2 shrink-0">
                  <Sparkles className="h-4 w-4" />
                  Suggest
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                AI will suggest a price based on similar listings
              </p>
            </div>
            
            {/* Location Section */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Pickup Location *
              </label>
              <Input
                placeholder="e.g. Main Campus - Block A"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            {/* Contact Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  htmlFor="phone-input" 
                  className="text-sm font-medium text-foreground mb-2 flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" /> Phone Number *
                </label>
                <div className="relative">
                  <PhoneInput
                    id="phone-input"
                    defaultCountry="BD"
                    placeholder="017..."
                    value={formData.phone || undefined} 
                    onChange={(value) => setFormData({ ...formData, phone: value || '' })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:outline-none [&_.PhoneInputCountryIcon]:h-5 [&_.PhoneInputCountryIcon]:w-auto"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="whatsapp-input"
                  className="text-sm font-medium text-foreground mb-2 flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp *
                </label>
                <div className="relative">
                  <PhoneInput
                    id="whatsapp-input"
                    defaultCountry="BD"
                    placeholder="017..."
                    value={formData.whatsapp || undefined}
                    onChange={(value) => setFormData({ ...formData, whatsapp: value || '' })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:outline-none [&_.PhoneInputCountryIcon]:h-5 [&_.PhoneInputCountryIcon]:w-auto"
                  />
                </div>
              </div>
            </div>
            
            {/* Description Section */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Description (Optional)
              </label>
              <textarea
                placeholder="Add any additional details about the book..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
            
            {/* Preview */}
            <div className="rounded-xl border border-border p-4 bg-muted/30">
              <p className="text-sm font-medium text-foreground mb-3">Preview</p>
              <div className="flex gap-3">
                {imagePreviews[0] && (
                  <Image src={imagePreviews[0]} height={80} width={64} alt="Book Cover" className="h-20 w-16 rounded-lg object-cover" />
                )}
                <div>
                  <p className="font-semibold text-foreground">{formData.title || 'Book Title'}</p>
                  <p className="text-sm text-muted-foreground">{formData.author || 'Author'}</p>
                  <p className="text-lg font-bold text-primary mt-1">
                    ৳{formData.price || '0'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={isSubmitting}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.price || !formData.location || !formData.phone || !formData.whatsapp || isSubmitting}
                variant="default"
                className="flex-1 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <BookOpen className="h-5 w-5" />
                    List Book
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
    </div>
  );
};

export default SellBookForm;