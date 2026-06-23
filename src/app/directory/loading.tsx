export default function DirectoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-10 w-64 bg-white/5 rounded-xl mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-40 bg-white/5 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
