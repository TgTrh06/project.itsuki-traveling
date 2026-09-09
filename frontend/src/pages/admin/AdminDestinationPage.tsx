import { useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import useDestinationStore from '../../store/destinationStore'
import DestinationCard from '../../components/DestinationCard'

export default function AdminDestinationPage() {
  const { destinations, fetchDestinations, loading } = useDestinationStore()

  useEffect(() => {
    fetchDestinations({ page: 1, limit: 100 }).catch(() => {})
  }, [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">All Destinations</h1>
      {loading ? (
        <p className="text-gray-500">Loading destinations...</p>
      ) : (
        <div className="space-y-4">
          {destinations.map((d) => (
            <DestinationCard key={d._id} dest={d} />
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
