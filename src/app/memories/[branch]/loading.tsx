export default function MemoriesLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-12 bg-white/5 rounded-2xl mb-6" />
      {[1,2,3].map(i => (
        <div key={i} className="bg-white/5 rounded-2xl overflow-hidden">
          <div className="h-48 bg-white/5" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-3/4 bg-white/5 rounded" />
            <div className="h-3 w-1/2 bg-white/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
