import { Loader2 } from 'lucide-react'
import React from 'react'

// Change 'loading' to 'Loading'
const Loading = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default Loading