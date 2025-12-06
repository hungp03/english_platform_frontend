import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingSkeleton() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header Skeleton */}
      <div className="border-b p-4 flex items-center gap-4">
        <Skeleton className="h-9 w-9 lg:hidden" />
        <Skeleton className="h-6 flex-1 max-w-md" />
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right space-y-1">
            <Skeleton className="h-3 w-16 ml-auto" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Lesson Content Skeleton - 75% on desktop */}
        <div className="flex-1 lg:w-3/4 overflow-auto">
          <div className="p-6 lg:p-8 max-w-5xl space-y-6">
            {/* Title */}
            <Skeleton className="h-10 w-3/4" />
            
            {/* Video/Content Area */}
            <Skeleton className="aspect-video w-full" />
            
            {/* Text Content */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton - 25% on desktop */}
        <div className="hidden lg:block lg:w-1/4 border-l bg-background">
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b">
              <Skeleton className="h-6 w-48" />
            </div>

            {/* Modules List */}
            <div className="flex-1 p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
