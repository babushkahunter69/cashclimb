const TICKERS = [
  { label: 'Reader-first', value: 'Guidance', accent: 'No hype' },
  { label: 'Coverage', value: 'Investing', accent: 'Debt' },
  { label: 'Coverage', value: 'Retirement', accent: 'Credit' },
  { label: 'Coverage', value: 'Taxes', accent: 'Property' },
  { label: 'Publishing', value: 'Reviewed', accent: 'Updated' },
  { label: 'Monetization', value: 'Clear disclosures', accent: 'No sponsored rankings' },
  { label: 'Style', value: 'Plain English', accent: 'Practical use cases' },
]

const MOBILE_BADGES = [
  'Reviewed guidance',
  'No sponsored rankings',
  'Plain-English explanations',
  'Clear editorial standards',
]

export default function Ticker() {
  const items = [...TICKERS, ...TICKERS]

  return (
    <div className="bg-bg-3 border-y border-border overflow-hidden">
      <div className="hidden md:block ticker-mask">
        <div className="ticker-animate flex w-max items-center gap-10 py-3 whitespace-nowrap">
          {items.map((item, i) => (
            <div
              key={`${item.label}-${item.value}-${i}`}
              className="inline-flex items-center gap-3 text-[11px] tracking-[0.14em] uppercase flex-none"
            >
              <span className="text-[#7E7873]">{item.label}</span>
              <span className="text-[#F0EDE8] font-medium">{item.value}</span>
              <span className="text-gold font-semibold">{item.accent}</span>
              <span className="text-[#3A3531]">/</span>
            </div>
          ))}
        </div>
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
