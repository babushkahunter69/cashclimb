import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CompoundCalculator from '@/components/CompoundCalculator'

export default function CompoundCalculatorPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-16">
        <CompoundCalculator />
      </main>
      <Footer />
    </>
  )
}
