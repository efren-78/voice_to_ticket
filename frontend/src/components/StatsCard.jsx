function StatsCard({ title, value, trendValue }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
      <div>
        <p className="text-slate-500 font-medium text-sm">
          {title}
        </p>

        <h2 className="text-4xl font-bold text-slate-900 mt-3">
          {value}
        </h2>
      </div>
      
      {trendValue && (
        <p className="text-green-600 mt-3 text-xs font-medium bg-green-50 px-2.5 py-1 rounded-md self-start">
          ↑ {trendValue}
        </p>
      )}

    </div>
  )
}

export default StatsCard