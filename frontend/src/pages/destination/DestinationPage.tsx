import { useEffect, useState } from 'react'
import JapanMap from '../../components/JapanMap'
import DestinationCard from '../../components/DestinationCard'
import useDestinationStore from '../../store/destinationStore'

export default function DestinationPage() {
  const { destinations, loading, fetchDestinations } = useDestinationStore()
  const [searchTerm, setSearchTerm] = useState("")
  // Hover state for map interaction
  const [hoveredDestSlug, setHoveredDestSlug] = useState(null)

  useEffect(() => {
    fetchDestinations({ page: 1, limit: 100 }).catch(() => { })
  }, [])

  const filteredDestinations = destinations.filter(dest =>
    dest.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      {/* Header */}
      <div
        className="bg-primary text-primary-foreground rounded-2xl py-6 text-center mb-4"
      >
        <h1 className="text-4xl font-bold font-serif">Destinations</h1>
        <p className="text-primary-foreground/80">Explore Japan Prefacture</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-8 rounded-xl border border-4 border-border shadow-sm">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <JapanMap hoveredDestSlug={hoveredDestSlug} />
        </div>

        {/* Sidebar: Search + List */}
        <div className="flex flex-col p-4">
          <h2 className="text-xl font-semibold mb-2">All Destinations</h2>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Scrollable List */}
          <div className="overflow-y-auto max-h-[500px] pr-1">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : filteredDestinations.length === 0 ? (
              <p className="text-gray-500">No destinations found.</p>
            ) : (
              <div className="space-y-2">
                {filteredDestinations.map(dest => (
                  // Destination Card with hover handlers
                  <div
                    key={dest._id}
                    onMouseEnter={() => setHoveredDestSlug(dest.slug)}
                    onMouseLeave={() => setHoveredDestSlug(null)}
                  >
                    <DestinationCard dest={dest} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
