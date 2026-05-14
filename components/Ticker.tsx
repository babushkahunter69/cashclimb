const MOBILE_BADGES = [
  'Reviewed guidance',
  'No sponsored rankings',
  'Plain-English explanations',
  'Clear editorial standards',
]

export default function Ticker() {
  return (
    <div className="border-y border-border bg-bg-3">
      <div className="mx-auto hidden max-w-7xl items-center justify-center gap-3 px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C8C0B9] md:flex">
        <span>Trusted personal finance education</span>
        <span className="text-[#5B554F]">/</span>
        <span>Reviewed for clarity</span>
        <span className="text-[#5B554F]">/</span>
        <span>No sponsored rankings</span>
      </div>

      <div className="md:hidden px-4 py-3">
        <div className="mx-auto grid max-w-sm grid-cols-2 gap-2">
          {MOBILE_BADGES.map((badge) => (
            <div
              key={badge}
              className="rounded-full border border-border bg-bg px-3 py-2 text-center text-[10px] font-bold uppercase leading-snug tracking-[0.13em] text-[#C8C0B9]"
            >
              {badge}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
