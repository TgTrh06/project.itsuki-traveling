import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import useAuthStore from '../store/authStore'
import useArticleStore from '../store/articleStore'
import toast from 'react-hot-toast'

export default function ArticleCard({ article }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const deleteArticle = useArticleStore((state) => state.deleteArticle)
  const destinationSlug = article.destination?.slug || "";

  const handleDelete = async (articleId, articleTitle) => {
    // Hỏi người dùng xác nhận trước khi xóa
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${articleTitle}"?`)) {
      return // Dừng nếu người dùng hủy
    }

    try {
      await deleteArticle(articleId)

      toast.success(`Đã xóa bài viết "${articleTitle}" thành công!`)

      navigate('/admin/articles')
    } catch (error) {
      toast.error(error.message || 'Lỗi khi xóa bài viết.')
    }
  }

  return (
    <div className="flex flex-col md:flex-row bg-card rounded-xl shadow-md overflow-hidden border border-border hover:shadow-lg transition-shadow">
      {/* Left: Image (3/10) */}
      <div className="md:w-3/12 w-full h-48 md:h-auto">
        <img
          src={
            article.imageUrl
              ? (article.imageUrl.startsWith('http') ? article.imageUrl : `${api.defaults.baseURL.replace(/\/api\/?$/, '')}${article.imageUrl}`)
              : "/images/default-article.jpg"
          }
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right: Content (7/10) */}
      <div className="md:w-9/12 w-full p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-primary mb-1">{article.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">By {article.author?.name}</p>
          <p className="text-foreground text-sm line-clamp-3">
            {article.summary || article.description}
          </p>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <Link
            to={`/articles/${destinationSlug}/${article.slug}`}
            className="text-sm text-primary hover:opacity-80 font-semibold transition-opacity"
          >
            Read More →
          </Link>

          {user?.role === 'admin' && (
            <div className="flex gap-2 text-xs">
              {/* EDIT Link */}
              <Link
                to={`/admin/articles/${article._id}/edit`}
                className="text-primary hover:opacity-80"
              >
                Edit
              </Link>
              <span className="text-muted-foreground">|</span>
              {/* DELETE Button */}
              <button
                onClick={() => handleDelete(article._id, article.title)}
                className="text-destructive hover:opacity-80"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}