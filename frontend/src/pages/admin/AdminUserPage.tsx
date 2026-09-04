import { useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import useUserStore from '../../store/userStore' // giả sử bạn có store này

export default function AdminUserPage() {
  const { users, fetchUsers, loading } = useUserStore()

  useEffect(() => {
    fetchUsers().catch(() => {})
  }, [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">All Users</h1>
      {loading ? (
        <p className="text-gray-500">Loading users...</p>
      ) : (
        <ul className="space-y-2 text-sm text-gray-700">
          {users.map((u) => (
            <li key={u._id} className="border-b py-2">
              {u.name || u.username} – {u.email}
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  )
}
