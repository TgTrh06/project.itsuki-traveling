import { useState, useEffect } from 'react'
import usePlanStore from '../store/planStore'
import useAuthStore from '../store/authStore'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import toast from 'react-hot-toast'
import { Trash2, MapPin, Navigation, Settings } from 'lucide-react'

// Fix Leaflet icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

// Component to fit map bounds
function MapUpdater({ items }) {
  const map = useMap()
  useEffect(() => {
    if (items.length > 0) {
      const bounds = L.latLngBounds(items.map(i => [i.location.lat, i.location.lng]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [items, map])
  return null
}

export default function PlanningPage() {
  const { plannedItems, removeItem, clearPlan, addItem, loadForUser, currentUserId } = usePlanStore()
  const { user } = useAuthStore()
  const [optimizedItems, setOptimizedItems] = useState([])
  const [routeInfo, setRouteInfo] = useState(null)

  // Route Settings
  const [travelMode, setTravelMode] = useState('car') // 'car' | 'moto'
  const [avoidTolls, setAvoidTolls] = useState(false)

  useEffect(() => {
    setOptimizedItems(plannedItems)
  }, [plannedItems])

  useEffect(() => {
    // nothing special now — per-user plans are separate and we do not merge guest plans
  }, [user, plannedItems])

  // Haversine formula to calculate distance in km
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return d
  }

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180)
  }

  const handleOptimize = () => {
    if (plannedItems.length < 2) {
      toast.error("Need at least 2 locations to optimize route")
      return
    }

    // Nearest Neighbor Algorithm
    let unvisited = [...plannedItems]
    const path = [unvisited.shift()] // Start with the first item
    let totalDist = 0

    while (unvisited.length > 0) {
      const current = path[path.length - 1]
      let nearest = null
      let minDist = Infinity
      let nearestIndex = -1

      unvisited.forEach((item, index) => {
        const dist = getDistance(
          current.location.lat, current.location.lng,
          item.location.lat, item.location.lng
        )
        if (dist < minDist) {
          minDist = dist
          nearest = item
          nearestIndex = index
        }
      })

      if (nearest) {
        path.push(nearest)
        totalDist += minDist
        unvisited.splice(nearestIndex, 1)
      }
    }

    setOptimizedItems(path)

    // Calculate time based on settings
    // Base speeds (km/h)
    let avgSpeed = 40 // Default Car

    if (travelMode === 'moto') {
      avgSpeed = 45 // Moto is slightly faster in traffic
    }

    if (avoidTolls) {
      avgSpeed = avgSpeed * 0.7 // Slower if avoiding tolls (side roads)
    }

    const hours = totalDist / avgSpeed
    const timeString = `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`

    setRouteInfo({
      distance: totalDist.toFixed(1),
      time: timeString,
      mode: travelMode,
      avoidTolls: avoidTolls
    })

    toast.success(`Route optimized for ${travelMode === 'moto' ? 'Motorcycle' : 'Car'}!`)
  }

  return (
    <div className="max-w-7xl mx-auto p-4 mt-20">
      <h1 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-2 font-serif">
        <Navigation className="w-8 h-8 text-primary" />
        Trip Planning
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List & Controls */}
        <div className="lg:col-span-1 space-y-6">      

          <div className="bg-card p-6 rounded-xl shadow-md border border-border">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Itinerary</h2>
                <div className="text-xs text-muted-foreground">Active plan: <span className="font-medium">{currentUserId && currentUserId !== 'guest' ? (user?.name || user?.email || currentUserId) : 'Guest'}</span></div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearPlan}
                  className="text-destructive hover:opacity-80 text-sm font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>

            {optimizedItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted rounded-lg border-2 border-dashed border-border">
                <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No locations added yet.</p>
                <p className="text-sm mt-1">Go to articles to add destinations.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {optimizedItems.map((item, index) => (
                  <div key={item._id} className="flex items-start gap-3 p-3 bg-muted rounded-lg border border-border hover:border-primary transition-colors group">
                    <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{item.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{item.location?.address || "No address"}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {optimizedItems.length > 1 && (
              <button
                onClick={handleOptimize}
                className="w-full mt-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
              >
                <Navigation className="w-4 h-4" />
                Optimize Route
              </button>
            )}

            {routeInfo && (
              <div className="mt-4 p-4 bg-accent/20 text-accent-foreground rounded-lg border border-accent">
                <h4 className="font-bold mb-1">Route Summary</h4>
                <div className="flex justify-between text-sm">
                  <span>Total Distance:</span>
                  <span className="font-mono font-bold">{routeInfo.distance} km</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Est. Travel Time:</span>
                  <span className="font-mono font-bold">{routeInfo.time}</span>
                </div>
                <div className="flex justify-between text-sm mt-1 text-muted-foreground">
                  <span>Mode:</span>
                  <span className="capitalize">{routeInfo.mode} {routeInfo.avoidTolls ? '(No Tolls)' : ''}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 italic">*Straight line distance approximation</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Map */}
        <div className="lg:col-span-2">
          <div className="h-[600px] rounded-xl overflow-hidden shadow-lg border border-border relative z-0">
            <MapContainer
              center={[35.6762, 139.6503]} // Default to Tokyo
              zoom={11}
              className="h-full w-full"
              style={{ zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Markers */}
              {optimizedItems.map((item, index) => (
                item.location && item.location.lat && (
                  <Marker
                    key={item._id}
                    position={[item.location.lat, item.location.lng]}
                  >
                    <Popup>
                      <div className="font-bold">{index + 1}. {item.title}</div>
                      <div className="text-sm">{item.location.address}</div>
                    </Popup>
                  </Marker>
                )
              ))}

              {/* Route Line */}
              {optimizedItems.length > 1 && (
                <Polyline
                  positions={optimizedItems
                    .filter(i => i.location && i.location.lat)
                    .map(i => [i.location.lat, i.location.lng])
                  }
                  color={travelMode === 'moto' ? "#e11d48" : "#2563eb"} // Red for moto, Blue for car
                  weight={4}
                  opacity={0.7}
                  dashArray={avoidTolls ? "5, 10" : "10, 10"} // More dashed if avoiding tolls
                />
              )}

              <MapUpdater items={optimizedItems.filter(i => i.location && i.location.lat)} />
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
