import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, Loader, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import useAuthStore from "../../store/authStore"
import Input from "../../components/Input"

const pageVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -20 }
}

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("")
	const [isSubmitted, setIsSubmitted] = useState(false)
	const { isLoading, forgotPassword } = useAuthStore()

	const handleSubmit = async (e) => {
		e.preventDefault()
		await forgotPassword(email)
		setIsSubmitted(true)
	}

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			exit="exit"
			variants={pageVariants}
			className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4"
		>
			<div className="w-full max-w-md">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="text-center mb-8"
				>
					<h1 className="text-4xl font-bold text-gray-900 mb-2">Forgot Password</h1>
					<p className="text-gray-600">We'll send you a reset link</p>
				</motion.div>

				{/* Card */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 border border-gray-100"
				>
					{!isSubmitted ? (
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Email Input */}
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Email Address
								</label>
								<div className="relative">
									<Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
									<input
										type="email"
										value={email}
										onChange={(e) => {
											setEmail(e.target.value)
											useAuthStore.setState({ error: null })
										}}
										placeholder="itsuki@example.com"
										className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-all"
										required
									/>
								</div>
							</div>

							<button
								type="submit"
								disabled={isLoading}
								className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{isLoading ? (
									<>
										<Loader className="w-5 h-5 animate-spin" />
										Sending...
									</>
								) : (
									"Send Reset Link"
								)}
							</button>
						</form>
					) : (
						<div className="text-center">
							<div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
								<Mail className="h-8 w-8 text-white" />
							</div>
							<p className="text-gray-700">
								If an account exists for <span className="font-semibold">{email}</span>, you will receive a password reset link shortly.
							</p>
						</div>
					)}
				</motion.div>

				{/* Back to Login */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="text-center mt-6"
				>
					<Link
						to="/auth/login"
						className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Login
					</Link>
				</motion.div>
			</div>
		</motion.div>
	)
}
