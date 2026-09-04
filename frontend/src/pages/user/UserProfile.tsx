import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Lock, Edit2, X } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export default function UserProfile() {
  const { user, isAuthenticated, checkAuth, setUser } = useAuthStore()
  const navigate = useNavigate()
  const [articleCount, setArticleCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  // Change Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    const verify = async () => {
      if (!isAuthenticated) {
        await checkAuth()
      }
    }
    verify()
  }, [isAuthenticated, checkAuth])

  useEffect(() => {
    if (!isAuthenticated || user?.role === 'admin') {
      navigate('/auth/login')
      return
    }

    const fetchStats = async () => {
      try {
        setLoading(true)
        // Fetch user's articles
        const artRes = await api.get(`/articles?author=${user?._id}`)
        setArticleCount(artRes.data.total || 0)
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user?._id) {
      fetchStats()
      setEditName(user.name || '')
      setEditEmail(user.email || '')
    }
  }, [isAuthenticated, user, navigate])

  const handleEditProfile = async (e) => {
    e.preventDefault()
    if (!editName.trim()) {
      toast.error('Name is required')
      return
    }

    try {
      setEditLoading(true)
      const res = await api.put('/auth/profile', {
        name: editName,
        email: editEmail
      })

      setUser(res.data.user)
      toast.success('Profile updated successfully!')
      setShowEditModal(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setEditLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      setPasswordLoading(true)
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      })

      toast.success('Password changed successfully!')
      setShowPasswordModal(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!isAuthenticated || user?.role === 'admin') {
    return null
  }

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A'

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen pt-20 bg-gradient-to-b from-secondary to-background"
    >
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-lg shadow-lg p-8 mb-8 border border-border"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif">{user?.name || user?.username}</h1>
              <p className="text-muted-foreground mt-1">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-lg shadow-md p-6 border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-semibold">Member Since</p>
                <p className="text-2xl font-bold text-foreground mt-2">{joinDate}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-lg shadow-md p-6 border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-semibold">My Articles</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {loading ? '...' : articleCount}
                </p>
              </div>
              <User className="w-8 h-8 text-primary" />
            </div>
          </motion.div>
        </div>

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg shadow-md p-8 mb-8 border border-border"
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 font-serif">Account Information</h2>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-muted-foreground">Full Name</label>
              <p className="text-lg text-foreground mt-1">{user?.name || user?.username}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-muted-foreground">Email</label>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <p className="text-lg text-foreground">{user?.email}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-muted-foreground">Account Type</label>
              <p className="text-lg text-foreground mt-1">
                <span className="inline-block px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-semibold">
                  {user?.role === 'admin' ? 'Administrator' : 'Regular User'}
                </span>
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-muted-foreground">Member Since</label>
              <p className="text-lg text-foreground mt-1">{joinDate}</p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4"
        >
          <button
            onClick={() => setShowEditModal(true)}
            className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold flex items-center justify-center gap-2 shadow-md"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex-1 bg-muted text-foreground py-3 rounded-lg hover:bg-muted/80 transition-colors font-semibold flex items-center justify-center gap-2 shadow-md"
          >
            <Lock className="w-4 h-4" />
            Change Password
          </button>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg shadow-xl p-6 max-w-md w-full border border-border"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-foreground">Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )
      }

      {/* Change Password Modal */}
      {
        showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-lg shadow-xl p-6 max-w-md w-full border border-border"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-foreground">Change Password</h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
    </motion.div>
  )
}
