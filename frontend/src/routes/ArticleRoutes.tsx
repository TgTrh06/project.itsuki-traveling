import { Routes, Route } from "react-router-dom";
import ArticleListPage from "../pages/articles/ArticleListPage";
import ArticleCreatePage from "../pages/articles/ArticleCreatePage";
import ArticleEditPage from "../pages/articles/ArticleEditPage";
import ArticleDetailPage from "../pages/articles/ArticleDetailPage";

const ArticleRoutes = () => {
    return (
        <Routes>
            <Route index element={<ArticleListPage />} />
            <Route path="/create" element={<ArticleCreatePage />} />
            <Route path="/:id/edit" element={<ArticleEditPage />} />
            <Route path="/:city/:slug" element={<ArticleDetailPage />} />
        </Routes>
    );
};

export default ArticleRoutes;
