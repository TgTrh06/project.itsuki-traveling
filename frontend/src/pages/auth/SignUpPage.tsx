import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, User, Loader } from "lucide-react"
import { motion } from "framer-motion"
import useAuthStore from "../../store/authStore"
import PasswordStrengthMeter from "../../components/PasswordStrengthMeter"

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { signup, error, isLoading } = useAuthStore()

  // Validate form fields in real-time
  const validateField = (field, value) => {
    const newErrors = { ...errors }
    
    if (field === 'name') {
      if (!value) {
        newErrors.name = 'Name is required'
      } else if (value.length < 2) {
        newErrors.name = 'Name must be at least 2 characters'
      } else {
        delete newErrors.name
      }
    }
    
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!value) {
        newErrors.email = 'Email is required'
      } else if (!emailRegex.test(value)) {
        newErrors.email = 'Please enter a valid email'
      } else {
        delete newErrors.email
      }
    }
    
    if (field === 'password') {
      if (!value) {
        newErrors.password = 'Password is required'
      } else if (value.length < 8) {
        newErrors.password = 'Password must be at least 8 characters'
      } else if (!/[A-Z]/.test(value)) {
        newErrors.password = 'Must contain uppercase letter'
      } else if (!/[a-z]/.test(value)) {
        newErrors.password = 'Must contain lowercase letter'
      } else if (!/[0-9]/.test(value)) {
        newErrors.password = 'Must contain a number'
      } else {
        delete newErrors.password
      }
    }
    
    setErrors(newErrors)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    
    // Validate all fields before submit
    validateField('name', name)
    validateField('email', email)
    validateField('password', password)
    
    if (Object.keys(errors).length > 0) {
      return
    }
    
    try {
      await signup(name, email, password)
      navigate("/")
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen pt-20 bg-gradient-to-br from-secondary via-background to-accent/20 flex items-center justify-center px-4"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2 font-serif">Create Account</h1>
          <p className="text-muted-foreground">Join Itsuki no Tabi today</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 border border-border"
        >
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    validateField('name', e.target.value)
                    useAuthStore.setState({ error: null })
                  }}
                  placeholder="Itsuki Desu"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-ring bg-background text-foreground placeholder-muted-foreground transition-all ${
                    errors.name ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-ring'
                  }`}
                  required
                />
              </div>
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    validateField('email', e.target.value)
                    useAuthStore.setState({ error: null })
                  }}
                  placeholder="itsuki@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-ring bg-background text-foreground placeholder-muted-foreground transition-all ${
                    errors.email ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-ring'
                  }`}
                  required
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    validateField('password', e.target.value)
                    useAuthStore.setState({ error: null })
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-ring bg-background text-foreground placeholder-muted-foreground transition-all ${
                    errors.password ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-ring'
                  }`}
                  required
                />
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            {/* Password Strength */}
            <PasswordStrengthMeter password={password} />

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
              >
                <p className="text-sm text-destructive font-semibold">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              className="w-full bg-primary hover:opacity-90 text-primary-foreground font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        </motion.div>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <p className="text-foreground">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-primary hover:opacity-80 font-semibold transition-opacity"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
