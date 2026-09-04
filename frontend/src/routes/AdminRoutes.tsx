import { Routes, Route } from "react-router-dom";
import AdminProfile from "../pages/admin/AdminProfile";
import AdminArticlePage from "../pages/admin/AdminArticlePage";
import ArticleCreatePage from "../pages/articles/ArticleCreatePage";
import AdminUserPage from "../pages/admin/AdminUserPage";
import AdminDestinationPage from "../pages/admin/AdminDestinationPage";
import ArticleEditPage from "../pages/articles/ArticleEditPage";
import AdminPlansPage from "../pages/admin/AdminPlansPage";
import AdminInterestsPage from "../pages/admin/AdminInterestsPage";
import AdminPlanDetailPage from "../pages/admin/AdminPlanDetailPage";
import AdminInterestCRUDPage from "../pages/admin/AdminInterestCRUDPage";

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/profile" element={<AdminProfile />} />

            <Route path="/articles" element={<AdminArticlePage />} />
            <Route path="/articles/create" element={<ArticleCreatePage />} />
            <Route path="/articles/:id/edit" element={<ArticleEditPage />} />

            <Route path="/users" element={<AdminUserPage />} />

            <Route path="/destinations" element={<AdminDestinationPage />} />
            <Route path="/plans" element={<AdminPlansPage />} />
            <Route path="/interests" element={<AdminInterestsPage />} />
            <Route path="/interests/manage" element={<AdminInterestCRUDPage />} />
            <Route path="/plans/:userId" element={<AdminPlanDetailPage />} />
        </Routes>
    );
};

export default AdminRoutes;
