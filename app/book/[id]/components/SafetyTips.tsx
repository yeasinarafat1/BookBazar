import { Shield } from 'lucide-react'
import React from 'react'

const SafetyTips = () => {
  return (
    <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-900">Safety Tips</span>
                </div>
                <ul className="space-y-2 text-sm text-emerald-800">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>Meet at campus during daytime</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>Inspect the book before paying</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>Use digital payments for records</span>
                  </li>
                </ul>
              </div>
  )
}

export default SafetyTips