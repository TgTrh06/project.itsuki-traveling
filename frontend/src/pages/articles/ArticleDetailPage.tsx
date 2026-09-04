import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useArticleStore from '../../store/articleStore'
import apiClient from '../../utils/api'
import useCommentStore from '../../store/commentStore'
import useAuthStore from '../../store/authStore'
import usePlanStore from '../../store/planStore'
import toast from 'react-hot-toast'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

export default function ArticleDetailPage() {
  const { city, slug } = useParams()
  const { user } = useAuthStore()
  const { addItem, plannedItems } = usePlanStore()

  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(false)
  const [nearbyArticles, setNearbyArticles] = useState([])
  const [nearbyLoading, setNearbyLoading] = useState(false)

  const [commentContent, setCommentContent] = useState('')
  const [isLiking, setIsLiking] = useState(false)

  const { getArticleBySlug, likeArticle, fetchArticles } = useArticleStore()
  const { comments, fetchComments, addComment, loading: commentLoading } = useCommentStore()

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const { article: fetchedArticle } = await getArticleBySlug(city, slug)
        setArticle(fetchedArticle)

        if (fetchedArticle) {
          fetchComments(fetchedArticle._id)

          // Fetch nearby articles from same destination
          try {
            setNearbyLoading(true)
            // Pass destination id or slug (prefer id if populated)
            const destParam = fetchedArticle.destination?._id || fetchedArticle.destination || ''
            const nearbyRes = await fetchArticles({ destination: destParam, limit: 3 })
            // fetchArticles returns an object: { data, total, page, pages }
            const nearbyList = (nearbyRes && (nearbyRes.data || nearbyRes.data === null)) ? nearbyRes.data : nearbyRes.data || nearbyRes.data
            // Normalize to array (defensive)
            const arr = Array.isArray(nearbyList) ? nearbyList : (nearbyRes?.data || nearbyRes?.data?.data || [])
            const filtered = arr.filter(a => a._id !== fetchedArticle._id).slice(0, 2)
            setNearbyArticles(filtered)
          } catch (err) {
            console.error('Error fetching nearby articles:', err)
            setNearbyArticles([])
          } finally {
            setNearbyLoading(false)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [city, slug, getArticleBySlug, fetchComments, fetchArticles])

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error("Login to leave a comment")
      return
    }
    if (!commentContent.trim()) {
      toast.error("Comment cannot be empty")
      return
    }

    try {
      await addComment(article._id, commentContent.trim())
      setCommentContent('')
      toast.success("Comment added successfully")
    } catch (error) {
      toast.error(error.message || "Error in comment.")
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error("Login required to like the article");
      return;
    }
    if (isLiking) return;

    // Optimistic update
    const userId = user._id;
    const currentLikes = article.meta?.likes || [];
    const isCurrentlyLiked = currentLikes.some(id => String(id) === String(userId));

    let newLikesArray;
    if (isCurrentlyLiked) {
      newLikesArray = currentLikes.filter(id => String(id) !== String(userId));
    } else {
      newLikesArray = [...currentLikes, userId];
    }

    // Update UI immediately
    setArticle((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        likes: newLikesArray
      }
    }));

    setIsLiking(true);
    try {
      await likeArticle(article._id);
      if (isCurrentlyLiked) {
        toast.success("Unliked article.");
      } else {
        toast.success("Liked article!");
      }
    } catch (error) {
      // Revert if error
      setArticle((prev) => ({
        ...prev,
        meta: {
          ...prev.meta,
          likes: currentLikes
        }
      }));
      toast.error(error.message || "Error in like article.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddToPlan = () => {
    if (!article) return
    addItem(article)
    toast.success("Added to plan!")
  }

  if (loading) return <div className="p-4">Loading...</div>
  if (!article) return <div className="p-4">Article not found</div>

  const likedByUser = article.meta?.likes?.some(
    (id) => String(id) === String(user?._id)
  )
  const likesCount = article.meta?.likes?.length || 0;
  const isPlanned = plannedItems.some(item => item._id === article?._id)

  return (
    <div className="max-w-6xl mx-auto p-4 mt-20">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* MAIN CONTENT - Left Side (2/3 width) */}
        <div className="lg:col-span-2">
          {/* Article Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-3 text-foreground font-serif">{article.title}</h1>

            <p className="text-sm text-muted-foreground mb-2">
              {new Date(article.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })} • {article.readTime || '6'} min read
            </p>

            {/* Author Info + Add to Plan in single row */}
            <div className="flex items-center justify-between gap-3 my-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground font-semibold">
                    {article.author?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">By {article.author?.name}</p>
                  <p className="text-xs text-muted-foreground">Community writer</p>
                </div>
              </div>

              <div>
                {user && (
                  <button
                    onClick={handleAddToPlan}
                    disabled={isPlanned}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm
                      ${isPlanned
                        ? 'bg-primary text-primary-foreground cursor-default'
                        : 'bg-primary text-primary-foreground hover:opacity-90'}
                    `}
                  >
                    {isPlanned ? '✓ Added to Plan' : '+ Add to Plan'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cover Image (if available) */}
          {article.imageUrl && (
            <div className="mb-4 w-full h-[360px] overflow-hidden rounded-xl border border-border">
              <img
                src={article.imageUrl.startsWith('http') ? article.imageUrl : `${apiClient.defaults.baseURL.replace(/\/api\/?$/, '')}${article.imageUrl}`}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none text-foreground mb-8 font-serif"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* LIKE & COMMENT COUNT SECTION */}
          <div className="flex items-center gap-6 py-4 border-t border-b border-border my-8">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm
                ${likedByUser
                  ? 'bg-primary text-primary-foreground hover:opacity-90'
                  : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'}
                disabled:opacity-70`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span>{likesCount}</span>
            </button>

            <div className="flex items-center gap-2 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{comments.length}</span>
            </div>

            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              <span>Share</span>
            </button>
          </div>

          {/* COMMENT FORM */}
          <div className="my-8 p-6 bg-muted rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-4 font-serif">Leave a comment</h2>
            {user ? (
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  className="w-full p-4 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                  rows="4"
                  placeholder="Share your thoughts..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  disabled={commentLoading}
                />
                <button
                  type="submit"
                  disabled={commentLoading || !commentContent.trim()}
                  className="mt-3 px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {commentLoading ? 'Sending...' : 'Post Comment'}
                </button>
              </form>
            ) : (
              <p className="text-destructive">
                Please
                <Link to="/login" className="text-primary hover:underline ml-1">Login </Link> 
                to comment.
              </p>
            )}
          </div>

          {/* COMMENTS LIST */}
          <div className="my-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground font-serif">Comments ({comments.length})</h2>
            {commentLoading && <p className="text-muted-foreground">Loading comments...</p>}
            {comments.length === 0 && !commentLoading ? (
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            ) : (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c._id} className="p-4 bg-card border border-border rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                        <span className="text-accent-foreground font-semibold text-sm">
                          {c.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.user?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-foreground ml-11">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR - Right Side (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">

            {/* Information Card */}
            <div className="bg-primary text-primary-foreground p-4 rounded-t-lg shadow-md">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <h3 className="font-bold text-lg">Information</h3>
              </div>
            </div>

            {/* Map in Sidebar */}
            {article.location && article.location.lat && article.location.lng && (
              <div className="bg-card border border-border rounded-b-lg overflow-hidden shadow-md">
                <div className="h-[200px]">
                  <MapContainer
                    center={[article.location.lat, article.location.lng]}
                    zoom={12}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                    style={{ height: "100%", width: "100%", zIndex: 0 }}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[article.location.lat, article.location.lng]}>
                      <Popup>{article.location.address || article.title}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-primary">{city || 'Location'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Explore Nearby */}
            <div className="bg-card border border-border rounded-lg p-4 shadow-md">
              <h3 className="font-bold text-lg mb-4 text-foreground">EXPLORE NEARBY</h3>
              {nearbyLoading ? (
                <p className="text-sm text-muted-foreground">Loading nearby articles...</p>
              ) : nearbyArticles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No other articles in this destination.</p>
              ) : (
                <div className="space-y-4">
                  {nearbyArticles.map((nearby) => (
                    <Link
                      key={nearby._id}
                      to={`/articles/${nearby.destination?.slug || city}/${nearby.slug}`}
                      className="flex gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-20 h-20 bg-muted rounded flex-shrink-0 overflow-hidden">
                        {(nearby.imageUrl || nearby.cover) ? (
                          <img
                            src={nearby.imageUrl || nearby.cover}
                            alt={nearby.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">No image</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">
                          {nearby.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">By {nearby.author?.name || 'Unknown'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <a
                href={`/destinations/${city}`}
                className="w-full mt-4 block text-center text-primary font-semibold text-sm hover:underline"
              >
                Discover {city || 'More'}
              </a>
            </div>

            {/* Top Articles
            <div className="bg-card border border-border rounded-lg p-4 shadow-md">
              <h3 className="font-bold text-lg mb-4 text-foreground">TOP ARTICLES</h3>
              <div className="space-y-3">
                <div className="text-sm text-foreground hover:text-primary cursor-pointer transition-colors">
                  • Popular destination nearby
                </div>
                <div className="text-sm text-foreground hover:text-primary cursor-pointer transition-colors">
                  • Must-visit places
                </div>
                <div className="text-sm text-foreground hover:text-primary cursor-pointer transition-colors">
                  • Local food guide
                </div>
              </div>
            </div> */}

          </div>
        </div>

      </div>
    </div>
  )
}