import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix Leaflet icon
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

function MapEvents({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng)
        },
    })
    return null
}

export default function LocationPicker({ location, onLocationChange }) {
    const [position, setPosition] = useState(null)

    useEffect(() => {
        if (location && location.lat && location.lng) {
            setPosition([location.lat, location.lng])
        }
    }, [location])

    const handleLocationSelect = (latlng) => {
        setPosition([latlng.lat, latlng.lng])
        onLocationChange({ lat: latlng.lat, lng: latlng.lng })
    }

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-input shadow-sm relative z-0">
            <MapContainer
                center={position || [35.6762, 139.6503]} // Default to Tokyo
                zoom={position ? 13 : 5}
                className="h-full w-full"
                style={{ zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapEvents onLocationSelect={handleLocationSelect} />
                {position && <Marker position={position} />}
            </MapContainer>
            <div className="absolute top-2 right-2 bg-background/90 p-2 rounded shadow text-xs z-[1000]">
                {position ? (
                    <>
                        <p>Lat: {position[0].toFixed(6)}</p>
                        <p>Lng: {position[1].toFixed(6)}</p>
                    </>
                ) : (
                    <p>Click map to select location</p>
                )}
            </div>
        </div>
    )
}
