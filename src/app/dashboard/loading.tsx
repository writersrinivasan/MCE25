export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 w-48 bg-white/5 rounded-xl mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl" />)}
      </div>
    </div>
  )
}
