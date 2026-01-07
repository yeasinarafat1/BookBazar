'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

const SearchFilter = ({status}:{
    status: { label: string; value: string }[]
}) => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  // 1. Handle Search with Debounce (Wait 300ms after typing stops)
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }
    
    // Reset page to 1 when searching if you have pagination
    // params.set('page', '1'); 

    replace(`${pathname}?${params.toString()}`)
  }, 300)

  // 2. Handle Status Select Change (Update immediately)
  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams)
    
    if (status && status !== 'all') {
      params.set('status', status)
    } else {
      params.delete('status') // Remove param if 'all' is selected
    }
    
    // Reset page to 1 on filter change
    // params.set('page', '1');

    replace(`${pathname}?${params.toString()}`)
  }

  // Get current values from URL to sync UI on reload
  const currentSearch = searchParams.get('search')?.toString()
  const currentStatus = searchParams.get('status')?.toString() || 'all'

  return (
     <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by title or author..."
                    // Use defaultValue so input doesn't lock up while debouncing
                    defaultValue={currentSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <Select 
                  value={currentStatus} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-full sm:w-48 border-slate-200">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {status.map((stat) => (
                      <SelectItem key={stat.value} value={stat.value}>
                        {stat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
  )
}

export default SearchFilter