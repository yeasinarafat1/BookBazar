import { Button } from '@/components/ui/button'
import { MessageCircle, Phone, Star, User } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const SellerCard = ({ 
  SellerName,
  SellerUsername, 
  whatsapp, 
  contactNumber 
}: { 
  SellerName: string, 
  SellerUsername: string,
  whatsapp: string,
  contactNumber: string 
}) => {

  // Helper to remove spaces, dashes, etc. for the API links
  const sanitizeNumber = (num: string) => num.replace(/\D/g, '');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-20">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Seller
      </h3>
      <div className="flex items-center gap-3 mb-5">
        <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
          <User className="h-7 w-7 text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 mb-1">{SellerName}</p>
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700">{4}</span>
            <span className="text-sm text-gray-500">(24 reviews)</span>
          </div>
        </div>
      </div>

      <Link href={`/profile/${SellerUsername}`}>
      <Button variant="outline" className="w-full mb-3 border-gray-300 hover:bg-gray-50 cursor-pointer">
        View Profile
      </Button>
      </Link>

      <div className="space-y-2 mt-4">
        {/* WhatsApp Button */}
        <a 
          href={`https://wa.me/${sanitizeNumber(whatsapp)}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full"
        >
          <Button className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
            <MessageCircle className="h-5 w-5" />
            WhatsApp Seller
          </Button>
        </a>

        {/* Phone Dialer Button */}
        <a 
          href={`tel:${contactNumber}`} 
          className="block w-full"
        >
          <Button variant="outline" className="w-full gap-2 border-gray-300 hover:bg-gray-50">
            <Phone className="h-5 w-5" />
            Call Seller
          </Button>
        </a>
      </div>
    </div>
  )
}

export default SellerCard