export default function StatsSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 mb-2">2,500+</div>
            <div className="text-gray-600">Offres d'emploi</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 mb-2">850+</div>
            <div className="text-gray-600">Entreprises</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 mb-2">15,000+</div>
            <div className="text-gray-600">Candidats</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 mb-2">95%</div>
            <div className="text-gray-600">Taux de satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  )
}
