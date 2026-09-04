import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { Trash2, Edit2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'

export default function AdminInterestCRUDPage() {
    const [interests, setInterests] = useState([])
    const [loading, setLoading] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({ title: '', slug: '' })
    const [errors, setErrors] = useState({})

    const fetchInterests = async () => {
        setLoading(true)
        try {
            const res = await api.get('/interests')
            setInterests(res.data || [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load interests')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInterests()
    }, [])

    const validateForm = () => {
        const newErrors = {}
        if (!formData.title.trim()) newErrors.title = 'Title is required'
        if (!formData.slug.trim()) newErrors.slug = 'Slug is required'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        try {
            if (editingId) {
                await api.put(`/interests/${editingId}`, formData)
                toast.success('Interest updated')
            } else {
                await api.post('/interests', formData)
                toast.success('Interest created')
            }
            setFormData({ title: '', slug: '' })
            setEditingId(null)
            setErrors({})
            fetchInterests()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save interest')
        }
    }

    const handleEdit = (interest) => {
        setEditingId(interest._id)
        setFormData({ title: interest.title, slug: interest.slug })
        setErrors({})
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this interest?')) return
        try {
            await api.delete(`/interests/${id}`)
            toast.success('Interest deleted')
            fetchInterests()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete interest')
        }
    }

    const handleCancel = () => {
        setEditingId(null)
        setFormData({ title: '', slug: '' })
        setErrors({})
    }

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto p-6">
                <h2 className="text-2xl font-semibold mb-6 text-foreground">Manage Interests</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-1">
                        <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-md border border-border p-6">
                            <h3 className="font-semibold mb-4 text-foreground">
                                {editingId ? 'Edit Interest' : 'Create New Interest'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-foreground">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.title ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'
                                            }`}
                                        placeholder="e.g., Adventure"
                                    />
                                    {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-foreground">Slug</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.slug ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'
                                            }`}
                                        placeholder="e.g., adventure"
                                    />
                                    {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug}</p>}
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> {editingId ? 'Update' : 'Create'}
                                    </button>
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-4 py-2 bg-muted text-foreground rounded-lg hover:opacity-80 transition-opacity"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2">
                        <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
                            {loading ? (
                                <div className="p-6 text-center text-muted-foreground">Loading...</div>
                            ) : interests.length === 0 ? (
                                <div className="p-6 text-center text-muted-foreground">No interests yet</div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {interests.map(interest => (
                                        <div key={interest._id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold text-foreground">{interest.title}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{interest.slug}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(interest)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(interest._id)}
                                                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
