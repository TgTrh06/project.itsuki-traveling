import { useEffect } from 'react'
import useArticleStore from '../../store/articleStore'
import ArticleCard from '../../components/ArticleCard'
import AdminLayout from '../../components/AdminLayout'

export default function AdminArticlePage() {
  const { articles, fetchArticles, loading } = useArticleStore()

  useEffect(() => {
    fetchArticles({ page: 1, limit: 100 }).catch(() => {})
  }, [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">All Articles</h1>
      {loading ? (
        <p className="text-gray-500">Loading articles...</p>
      ) : (
        <div className="space-y-4">
          {articles.map((a) => (
            <ArticleCard key={a._id} article={a} />
          ))}
        </div>
      )}
    </AdminLayout>
  )
}