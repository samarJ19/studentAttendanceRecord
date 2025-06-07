// Loading Skeleton Components
export const TableSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-50 rounded-lg mb-4 p-4">
      <div className="flex space-x-4 mb-4">
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      </div>
    </div>
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="flex space-x-4 mb-4 p-4 bg-white rounded-lg shadow-sm"
      >
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    ))}
  </div>
);

export const FormSkeleton = () => (
  <div className="animate-pulse bg-white rounded-lg p-6 shadow-sm">
    <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);
