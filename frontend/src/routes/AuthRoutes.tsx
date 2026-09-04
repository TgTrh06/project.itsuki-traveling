import { Routes, Route } from "react-router-dom";
import LoginPage from '../pages/auth/LoginPage'
import SignUpPage from '../pages/auth/SignUpPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import EmailVerificationPage from '../pages/auth/EmailVerificationPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'

const AuthRoutes = () => {
    return (
        <Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<SignUpPage />} />
			<Route path="/forgot-password" element={<ForgotPasswordPage />} />
			<Route path="/verify-email" element={<EmailVerificationPage />} />
			<Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Routes>
    );
}

export default AuthRoutes;