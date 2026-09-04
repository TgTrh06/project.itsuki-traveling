import { Routes, Route } from "react-router-dom";
import DestinationPage from "../pages/destination/DestinationPage";
import DestinationDetailPage from "../pages/destination/DestinationDetailPage";

const DestinationRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<DestinationPage />} />
            <Route path="/:slug" element={<DestinationDetailPage />} />
        </Routes>
    );
}

export default DestinationRoutes;