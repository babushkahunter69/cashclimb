const ITEMS = [
  'Reviewed financial guidance',
  'No sponsored rankings',
  'Plain-English explanations',
  'Practical finance use cases',
  'Clear editorial standards',
]

export default function Ticker() {
  return (
    <div className="bg-bg-3 border-y border-border">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] tracking-[0.14em] uppercase">
          {ITEMS.map((item, index) => (
            <div key={item} className="flex items-center gap-6">
              <span className="text-[#D8D1CA] font-medium">{item}</span>
              {index !== ITEMS.length - 1 && (
                <span className="text-[#4B4540]">•</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
