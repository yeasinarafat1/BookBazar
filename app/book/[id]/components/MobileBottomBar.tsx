import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import React from 'react'

const MobileBottomBar = ({price}:{price: number}) => {
  return (
     <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white shadow-lg p-4 md:hidden z-50">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Price</p>
                <p className="text-2xl font-bold text-emerald-600">৳{price}</p>
              </div>
              <Button size="lg" className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6">
                <MessageCircle className="h-5 w-5" />
                Contact Seller
              </Button>
            </div>
          </div>
  )
}

export default MobileBottomBar