import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    if (!user) {
        return <div className='flex justify-center items-center h-screen'>Loading...</div>;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
