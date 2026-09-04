import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { Download, Users, FileDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'

export default function AdminPlansPage() {
    const [plans, setPlans] = useState([])
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [loading, setLoading] = useState(false)

    const fetchPlans = async (p = 1) => {
        setLoading(true)
        try {
            const res = await api.get(`/admin/plans?page=${p}&limit=20`)
            setPlans(res.data.data || [])
            setPage(res.data.page || 1)
            setPages(res.data.pages || 1)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPlans(1)
    }, [])

    const handleExportJSON = () => {
        const url = api.defaults.baseURL + '/admin/plans-export'
        window.open(url, '_blank')
    }

    const handleExportCSV = () => {
        const url = api.defaults.baseURL + '/admin/plans-export-csv'
        window.open(url, '_blank')
    }

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-semibold text-foreground">User Plans</h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportJSON}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 transition-colors"
                        >
                            <Download className="w-4 h-4" /> Export JSON
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="px-4 py-2 rounded-lg bg-green-600 text-white flex items-center gap-2 hover:bg-green-700 transition-colors"
                        >
                            <FileDown className="w-4 h-4" /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto bg-card rounded-lg shadow-md border border-border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted border-b border-border">
                            <tr>
                                <th className="p-4 text-left font-semibold">User</th>
                                <th className="p-4 text-left font-semibold">Items</th>
                                <th className="p-4 text-left font-semibold">Updated</th>
                                <th className="p-4 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td className="p-4 text-center text-muted-foreground" colSpan={4}>
                                        Loading...
                                    </td>
                                </tr>
                            ) : plans.length === 0 ? (
                                <tr>
                                    <td className="p-4 text-center text-muted-foreground" colSpan={4}>
                                        No plans found
                                    </td>
                                </tr>
                            ) : (
                                plans.map(p => (
                                    <tr key={p._id} className="border-t border-border hover:bg-muted transition-colors">
                                        <td className="p-4">
                                            <Link
                                                to={`/admin/plans/${p.user?._id}`}
                                                className="text-blue-600 hover:underline font-medium"
                                            >
                                                {p.user?.name || p.user?.email || p.user?._id}
                                            </Link>
                                        </td>
                                        <td className="p-4 text-muted-foreground">{(p.items || []).length}</td>
                                        <td className="p-4 text-muted-foreground">{new Date(p.updatedAt).toLocaleString()}</td>
                                        <td className="p-4">
                                            <Link
                                                to={`/admin/plans/${p.user?._id}`}
                                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Page {page} / {pages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => fetchPlans(page - 1)}
                            className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page >= pages}
                            onClick={() => fetchPlans(page + 1)}
                            className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
