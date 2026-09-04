import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../../store/authStore'
import useDestinationStore from '../../store/destinationStore'
import InterestTagInput from '../../components/InterestTagInput'
import LocationPicker from '../../components/LocationPicker'
import api from '../../utils/api'
import apiClient from '../../utils/api'
import AdminLayout from '../../components/AdminLayout'
import { MapPin } from 'lucide-react'

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export default function ArticleCreatePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { destinations, fetchDestinations } = useDestinationStore()

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
    destination: '',
    interests: [],
    location: { lat: null, lng: null, address: '' }
  })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/articles')
      return
    }
    fetchDestinations({ page: 1, limit: 100 }).catch(() => { })
  }, [user, navigate, fetchDestinations])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleInterestChange = (interests) => {
    setFormData(prev => ({ ...prev, interests }))
  }

  const handleLocationChange = (loc) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, lat: loc.lat, lng: loc.lng }
    }))
    setFieldErrors(prev => {
      const copy = { ...prev }
      if (copy.location) delete copy.location
      return copy
    })
  }

  const handleAddressChange = (e) => {
    const address = e.target.value
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, address }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setFieldErrors({})

    try {
      const errors = {}
      if (!formData.title) errors.title = 'Title is required'
      if (!formData.summary) errors.summary = 'Summary is required'
      if (!formData.content) errors.content = 'Content is required'
      if (!formData.destination) errors.destination = 'Destination is required'

      // Validate location
      if (!formData.location || !formData.location.lat || !formData.location.lng) {
        errors.location = 'Please select a location on the map'
      }

      if (Object.keys(errors).length) {
        setFieldErrors(errors)
        setLoading(false)
        return
      }

      // Build multipart form payload to support file upload
      const payload = new FormData()
      payload.append('title', formData.title)
      payload.append('summary', formData.summary)
      payload.append('content', formData.content)
      payload.append('destination', formData.destination)
      payload.append('interests', JSON.stringify(formData.interests))
      payload.append('location', JSON.stringify(formData.location))
      if (file) payload.append('image', file)
      else if (formData.imageUrl) payload.append('imageUrl', formData.imageUrl)

      const res = await apiClient.post('/articles', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (!e.total) return
          const percent = Math.round((e.loaded * 100) / e.total)
          setUploadProgress(percent)
        }
      })
      if (res.data.success) {
        setUploadProgress(100)
        setTimeout(() => setUploadProgress(0), 500)
        navigate('/admin/articles')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create article')
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <AdminLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={pageVariants}
        className="min-h-screen pt-8 pb-12"
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground font-serif mb-2">Create New Article</h1>
            <p className="text-muted-foreground">Share your travel experiences and insights</p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl shadow-lg p-8 border border-border"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Article Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter article title"
                  className="w-full px-4 py-2.5 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                {fieldErrors.title && <p className="mt-1 text-sm text-destructive">{fieldErrors.title}</p>}
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Summary *
                </label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  placeholder="Brief summary (1-2 sentences)"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  required
                />
                {fieldErrors.summary && <p className="mt-1 text-sm text-destructive">{fieldErrors.summary}</p>}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your article content here..."
                  rows={8}
                  className="w-full px-4 py-2.5 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono text-sm"
                  required
                />
                {fieldErrors.content && <p className="mt-1 text-sm text-destructive">{fieldErrors.content}</p>}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Destination */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Destination *
                  </label>
                  <select
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="">Select a destination</option>
                    {destinations.map(dest => (
                      <option key={dest._id} value={dest._id}>
                        {dest.title}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.destination && <p className="mt-1 text-sm text-destructive">{fieldErrors.destination}</p>}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Cover Image (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      setFile(f || null)
                      if (f) setPreview(URL.createObjectURL(f))
                      else setPreview('')
                    }}
                    className="w-full p-2.5 bg-primary rounded-lg cursor-pointer text-sm text-white focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {preview || formData.imageUrl ? (
                    <div className="mt-3 w-full h-40 overflow-hidden rounded-lg border border-border">
                      <img
                        src={preview || (formData.imageUrl && (formData.imageUrl.startsWith('http') ? formData.imageUrl : `${api.defaults.baseURL.replace(/\/api\/?$/, '')}${formData.imageUrl}`))}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Location Picker */}
              <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Location
                </h3>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Address / Place Name</label>
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={handleAddressChange}
                    placeholder="e.g. Tokyo Tower"
                    className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Pin on Map</label>
                  <LocationPicker
                    location={formData.location}
                    onLocationChange={handleLocationChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Click on the map to set the exact coordinates.</p>
                  {fieldErrors.location && <p className="mt-1 text-sm text-destructive">{fieldErrors.location}</p>}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Interests
                </label>
                <InterestTagInput
                  value={formData.interests}
                  onChange={handleInterestChange}
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                >
                  <p className="text-sm text-destructive font-semibold">{error}</p>
                </motion.div>
              )}

              {/* Actions */}
              {/* Upload progress */}
              {uploadProgress > 0 && (
                <div className="pt-4">
                  <div className="w-full bg-muted h-2 rounded overflow-hidden">
                    <div className="h-2 bg-primary" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Uploading image: {uploadProgress}%</p>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-border">
                <button
                  type="submit"
                  disabled={loading || Object.keys(fieldErrors).length > 0}
                  className="flex-1 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg shadow-md hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Article'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/articles')}
                  className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </AdminLayout>
  )
}
