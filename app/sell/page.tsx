import { getLoggedInUser } from "@/lib/action/user";
import { redirect } from "next/navigation";

import SellBookForm from "./__components/SellBookForm";
import VerificationRequiredCard from "./__components/VerificationRequiredCard";

export default async function SellPage() {
  // 1. Get User
  const { user } = await getLoggedInUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // 2. 🔒 Check Verification Status
  if (user.verification_status !== 'verified') {
    return (
      <VerificationRequiredCard/>
    );
  }

  // 3. ✅ If Verified, Render the Sell Form
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <main className="container mx-auto py-6 px-4">
         <SellBookForm />
      </main>
    </div>
  );
}