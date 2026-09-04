import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../utils/api'
import { ArrowLeft, MapPin } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'

export default function AdminPlanDetailPage() {
    const { userId } = useParams()
    const [plan, setPlan] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await api.get(`/admin/plans/${userId}`)
                setPlan(res.data.plan)
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load plan')
            } finally {
                setLoading(false)
            }
        }
        if (userId) fetch()
    }, [userId])

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="text-center text-muted-foreground">Loading...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <Link to="/admin/plans" className="flex items-center gap-2 text-blue-600 hover:underline mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Plans
                </Link>
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg">{error}</div>
            </div>
        )
    }

    if (!plan) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <Link to="/admin/plans" className="flex items-center gap-2 text-blue-600 hover:underline mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Plans
                </Link>
                <div className="text-muted-foreground">No plan found</div>
            </div>
        )
    }

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto p-6">
                <Link to="/admin/plans" className="flex items-center gap-2 text-blue-600 hover:underline mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Plans
                </Link>

                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-foreground">
                        Plan for {plan.user?.name || plan.user?.email || userId}
                    </h2>
                    <div className="text-sm text-muted-foreground mt-2">
                        Last updated: {new Date(plan.updatedAt).toLocaleString()}
                    </div>
                </div>

                <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
                    {(plan.items || []).length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground">
                            <MapPin className="w-10 h-10 mx-auto opacity-30 mb-2" />
                            No items in this plan
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {(plan.items || []).map((item, idx) => (
                                <div key={idx} className="p-6 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-foreground">{item.title || item._id}</h3>
                                            {item.location?.address && (
                                                <p className="text-sm text-muted-foreground mt-1">{item.location.address}</p>
                                            )}
                                            <div className="text-xs text-muted-foreground mt-2 font-mono space-y-1">
                                                <div>ID: {item._id}</div>
                                                {item.location && (
                                                    <div>
                                                        Coordinates: {item.location.lat}, {item.location.lng}
                                                    </div>
                                                )}
                                            </div>
                                            {item.meta && (
                                                <div className="mt-3 p-3 bg-muted rounded text-xs">
                                                    <div className="font-semibold mb-1">Metadata:</div>
                                                    <pre className="overflow-x-auto">{JSON.stringify(item.meta, null, 2)}</pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">
                        <div className="font-semibold mb-2">Plan Summary</div>
                        <div>Total Items: {(plan.items || []).length}</div>
                        <div>Plan ID: {plan._id}</div>
                        <div>User ID: {plan.user?._id}</div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
