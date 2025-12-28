import BooksClient from "./client";
import { mockBooks } from "@/constants";

export default function BooksPage() {
  return <BooksClient initialBooks={mockBooks} />;
}