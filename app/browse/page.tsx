import React, { Suspense } from 'react';
import { getVerifiedAndUnsoldBooks } from '@/lib/action/book';
import { BrowseContent } from './client'; // Make sure filename matches
import { Loader2 } from 'lucide-react';
import { console } from 'inspector';

// Next.js 15: params and searchParams are Promises
interface BrowsePageProps {
  params: Promise<{ slug?: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BrowsePage(props: BrowsePageProps) {
  // In Next.js 15, we await the params/searchParams if we need to access them in the server component.
  // Even if we don't use them here, it's good practice to type the props correctly.
  const searchParams = await props.searchParams;
  const params = await props.params;

  // Fetch data
  const initialBooks = await getVerifiedAndUnsoldBooks();

  return (
    // !!! CRITICAL FIX: The Suspense boundary fixes the build error !!!
  
      <BrowseContent initialBooks={initialBooks} />
    
  );
}