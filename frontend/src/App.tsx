import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import AuthRoutes from './routes/AuthRoutes'
import InterestsListPage from './pages/interest/InterestsListPage'
import UserProfile from './pages/user/UserProfile'
import DestinationRoutes from './routes/DestinationRoutes'
import ArticleRoutes from './routes/ArticleRoutes'
import ProtectedRoute from './components/ProtectedRoute'

const PlanningPage = lazy(() => import('./pages/PlanningPage'))
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'))

function App() {
	return (
		<div className="min-h-screen bg-appbg flex flex-col">
			<Navbar />
			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={true}
				closeOnClick={true}
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="dark"
			/>
			<main className="flex-1">
				<Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
				<Routes>
					<Route path="/" element={<HomePage />} />

					<Route path="/destinations/*" element={<DestinationRoutes />} />
					<Route path="/articles/*" element={<ArticleRoutes />} />

					<Route path="/auth/*" element={<AuthRoutes />} />

					<Route path="/user/profile" element={<UserProfile />} />

					<Route path="/admin/*" element={
						<ProtectedRoute>
							<AdminRoutes />
						</ProtectedRoute>}
					/>

					<Route path="/planning" element={
						<ProtectedRoute>
							<PlanningPage />
						</ProtectedRoute>
					} />

					<Route path="/interests/:slug" element={<InterestsListPage />} />
				</Routes>
				</Suspense>
			</main>
			<Footer />
		</div>
	)
}

export default App
