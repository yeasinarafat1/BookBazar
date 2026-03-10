import { WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
        <WifiOff className="h-10 w-10 text-emerald-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">You&apos;re Offline</h1>
      <p className="text-gray-500 max-w-sm mb-8">
        It looks like you&apos;ve lost your internet connection. Please check your network and try again.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
      >
        Try Again
      </Link>
    </div>
  );
}
