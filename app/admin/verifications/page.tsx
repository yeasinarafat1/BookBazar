import { getAllVerificationRequests } from "@/lib/action/admin";
import VerificationsClient from "./client";
import { mockVerifications } from "@/constants";

export default async function VerificationsPage() {
  const req= await getAllVerificationRequests()
 
  return <VerificationsClient requests={req || null} />;
}