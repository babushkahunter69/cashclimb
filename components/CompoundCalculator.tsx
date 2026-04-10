'use client'

import { useMemo, useState } from 'react'

function currency(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

export default function CompoundCalculator() {
  const [initial, setInitial] = useState(10000)
  const [monthly, setMonthly] = useState(500)
  const [years, setYears] = useState(20)
  const [rate, setRate] = useState(7)

  const result = useMemo(() => {
    const monthlyRate = rate / 100 / 12
    const totalMonths = years * 12

    let balance = initial
    let contributions = initial

    for (let i = 0; i < totalMonths; i++) {
      balance = balance * (1 + monthlyRate)
      balance += monthly
      contributions += monthly
    }

    return {
      futureValue: balance,
      contributions,
      growth: balance - contributions,
    }
  }, [initial, monthly, years, rate])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4">
          Financial Tool
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl font-black leading-[1.08] mb-6">
          Compound Growth
          <br />
          <span className="text-gold">Calculator</span>
        </h1>
        <p className="text-[#9A9490] text-lg leading-relaxed max-w-2xl">
          Estimate how regular contributions and long-term compounding can grow
          over time. Use it as a planning tool, not a prediction.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_0.95fr] gap-6">
        <section className="bg-bg-2 border border-border rounded-2xl p-8">
          <h2 className="font-serif text-2xl font-bold mb-6 text-[#F0EDE8]">
            Inputs
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-[#9A9490] mb-2">
                Initial amount
              </label>
              <input
                type="number"
                value={initial}
                onChange={(e) => setInitial(Number(e.target.value))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[#F0EDE8] outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-sm text-[#9A9490] mb-2">
                Monthly contribution
              </label>
              <input
                type="number"
                value={monthly}
                onChange={(e) => setMonthly(Number(e.target.value))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[#F0EDE8] outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-sm text-[#9A9490] mb-2">
                Years invested
              </label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[#F0EDE8] outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-sm text-[#9A9490] mb-2">
                Expected annual return (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[#F0EDE8] outline-none focus:border-gold"
              />
            </div>
          </div>
        </section>

        <section className="bg-bg-2 border border-border rounded-2xl p-8">
          <h2 className="font-serif text-2xl font-bold mb-6 text-[#F0EDE8]">
            Results
          </h2>

          <div className="space-y-4">
            <div className="border border-gold/30 rounded-xl p-5 bg-[rgba(212,175,55,0.05)]">
              <div className="text-sm text-[#9A9490] mb-2">Estimated future value</div>
              <div className="font-serif text-4xl font-black text-gold">
                {currency(result.futureValue)}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-bg border border-border rounded-xl p-5">
                <div className="text-sm text-[#9A9490] mb-2">Total contributions</div>
                <div className="text-2xl font-bold text-[#F0EDE8]">
                  {currency(result.contributions)}
                </div>
              </div>

              <div className="bg-bg border border-border rounded-xl p-5">
                <div className="text-sm text-[#9A9490] mb-2">Estimated growth</div>
                <div className="text-2xl font-bold text-[#F0EDE8]">
                  {currency(result.growth)}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-[#9A9490] leading-relaxed">
                This calculator uses a fixed return assumption and monthly
                compounding for simplicity. Real investment results will vary and
                may be lower or higher than shown.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
