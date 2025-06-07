export default function ErrorAlerts() {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6 shadow-sm">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-5 w-5 text-red-400">⚠</div>
        </div>
        <div className="ml-3">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
        <button
          className="ml-auto text-red-400 hover:text-red-600 transition-colors"
          onClick={() => setError(null)}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
