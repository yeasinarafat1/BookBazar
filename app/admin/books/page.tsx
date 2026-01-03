import { getAllBooks } from "@/lib/action/book";
import BooksClient from "./client";
import { mockBooks } from "@/constants";

export default async function BooksPage() {
  const books = await getAllBooks();
  console.log("Fetched books:", books);
  return <BooksClient books={books} />;
}