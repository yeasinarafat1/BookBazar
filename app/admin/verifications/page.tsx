import VerificationsClient from "./client";
import { mockVerifications } from "@/constants";

export default function VerificationsPage() {
  return <VerificationsClient initialDocs={mockVerifications} />;
}