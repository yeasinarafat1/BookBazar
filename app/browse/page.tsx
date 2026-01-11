import React from 'react'
import { BrowseContent } from './client'
import { getVerifiedAndUnsoldBooks } from '@/lib/action/book';

const page = async() => {
  const initialBooks = await getVerifiedAndUnsoldBooks();
  return (
    <BrowseContent initialBooks={initialBooks} />
  )
}

export default page