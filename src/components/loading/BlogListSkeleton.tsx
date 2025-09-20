export default function BlogListSkeleton() {
  return (
    <div className="space-y-8">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
        >
          <div className="md:flex">
            <div className="md:w-1/3 relative">
              <div className="w-full h-48 md:h-full bg-gray-200"></div>
            </div>
            <div className="md:w-2/3 p-6 md:p-8">
              <div className="flex items-center space-x-4 mb-3">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
