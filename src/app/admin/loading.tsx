export default function AdminLoading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-8 w-40 bg-white/5 rounded-xl mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white/5 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-white/5 rounded-2xl" />
    </div>
  )
}
