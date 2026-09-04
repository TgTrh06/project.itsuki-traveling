import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { Download, Tag } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'

export default function AdminInterestsPage() {
    const [interests, setInterests] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchInterests = async () => {
        setLoading(true)
        try {
            const res = await api.get('/admin/interests')
            setInterests(res.data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInterests()
    }, [])

    const handleExport = () => {
        const data = JSON.stringify(interests, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'interests.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Tag className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-semibold text-foreground">Interests</h2>
                    </div>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Download className="w-4 h-4" /> Export JSON
                    </button>
                </div>

                <div className="bg-card rounded-lg shadow-md border border-border p-6">
                    {loading ? (
                        <div className="text-center text-muted-foreground">Loading...</div>
                    ) : interests.length === 0 ? (
                        <div className="text-center text-muted-foreground">No interests found</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {interests.map(i => (
                                <div
                                    key={i._id}
                                    className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow bg-muted/50"
                                >
                                    <div className="font-semibold text-foreground">{i.title}</div>
                                    <div className="text-xs text-muted-foreground mt-1 font-mono">{i.slug}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                    Total: {interests.length} interests
                </div>
            </div>
        </AdminLayout>
    )
}
