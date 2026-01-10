import { CheckCircle, Package } from 'lucide-react'
import React from 'react'

const BookConditionDetails = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Condition Details</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">All pages intact</p>
                      <p className="text-sm text-gray-600">No missing or torn pages</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">No markings</p>
                      <p className="text-sm text-gray-600">Clean pages without highlights</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Well maintained</p>
                      <p className="text-sm text-gray-600">Carefully stored and handled</p>
                    </div>
                  </div>
                </div>
              </div>
  )
}

export default BookConditionDetails