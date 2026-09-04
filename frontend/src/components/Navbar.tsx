import { Link, useNavigate, useLocation } from "react-router-dom"
import { User, LogOut, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useAuthStore from "../store/authStore"
import useDestinationStore from "../store/destinationStore"

const dropdownVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
}

// Hàm phân loại dữ liệu để tạo layout nhiều cột
const categorizeDestinations = (destinations) => {
  // Sắp xếp destinations theo số bài viết giảm dần
  const sorted = [...destinations].sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0));
  
  const allDestinations = sorted.map(d => ({
    title: d.title,
    slug: d.slug,
    link: `/destinations/${d.slug}`,
    articleCount: d.articleCount || 0
  }));

  // Top 5-10 destinations với nhiều bài viết nhất là "Top Destinations"
  const topDestinations = allDestinations.slice(0, 10);

  // Phần còn lại là "Prefectures" (chia thành 3 cột)
  const prefectures = allDestinations.slice(10);

  const numPrefectureColumns = 3;
  const chunkSize = Math.ceil(prefectures.length / numPrefectureColumns);

  const prefectureColumns = [];
  for (let i = 0; i < numPrefectureColumns; i++) {
    prefectureColumns.push(prefectures.slice(i * chunkSize, i * chunkSize + chunkSize));
  }

  return {
    'Top Destinations': topDestinations,
    'Prefectures': prefectureColumns,
  };
};


function NavDropdown({ label, categorizedItems, isOpen, onToggle }) {
  const topDestinations = categorizedItems['Top Destinations'] || [];
  const prefectureColumns = categorizedItems['Prefectures'] || [];

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 px-3 py-2 text-foreground hover:text-primary transition-colors"
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
            className="absolute left-0 mt-3 w-[800px] bg-card border border-border rounded-lg shadow-lg z-50 p-4 origin-top"
            style={{ transform: 'translateX(-50%)', left: '0%' }}
          >
            <Link to="/destinations" className="flex items-gap-2 text-primary mb-4 font-medium hover:underline">
              <span role="img" aria-label="map-pin">📍</span>
              Japan Map
            </Link>

            {/* Cấu trúc Grid 4 cột chính */}
            <div className="grid grid-cols-4 gap-x-8 max-h-[400px] overflow-y-auto pr-4">

              {/* Cột 1: Top Destinations */}
              <div className="col-span-1">
                <h3 className="font-bold text-foreground mb-2">Top Destinations</h3>
                <div className="space-y-1 text-sm">
                  {topDestinations.map((item) => (
                    <Link
                      key={item.title}
                      to={item.link}
                      className="flex items-center justify-between text-muted-foreground hover:text-primary transition-colors group"
                      onClick={onToggle}
                    >
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Cột 2, 3, 4: Prefectures */}
              {prefectureColumns.map((column, index) => (
                <div key={index} className="col-span-1">
                  {/* Tiêu đề "Prefectures" chỉ hiện ở cột đầu tiên, các cột sau dùng div rỗng để giữ khoảng cách */}
                  {index === 0 ? (
                    <h3 className="font-bold text-foreground mb-2">Prefectures</h3>
                  ) : (
                    <div className="h-6 mb-2"></div>
                  )}

                  <div className="space-y-1 text-sm">
                    {column.map((item) => (
                      <Link
                        key={item.title}
                        to={item.link}
                        className="block text-muted-foreground hover:text-primary transition-colors"
                        onClick={onToggle}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { destinations, fetchDestinations } = useDestinationStore()
  const [openDropdown, setOpenDropdown] = useState(null)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Tự động đóng dropdown khi click ra ngoài
  useEffect(() => {
    const closeDropdowns = (e) => {
      // Chỉ đóng nếu click nằm ngoài khu vực dropdown/button
      if (!e.target.closest('.relative')) {
        setOpenDropdown(null)
        setIsUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', closeDropdowns)
    return () => document.removeEventListener('mousedown', closeDropdowns)
  }, [])

  useEffect(() => {
    fetchDestinations({ page: 1, limit: 100 }).catch(() => { })
  }, [fetchDestinations])

  const handleLogout = async () => {
    try {
      await logout()
      setIsUserDropdownOpen(false)
      navigate("/")
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // ⚠️ SỬ DỤNG HÀM PHÂN LOẠI MỚI Ở ĐÂY
  const categorizedDestinationItems = categorizeDestinations(destinations);


  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-card shadow-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left: Logo + Navigation */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-bold text-primary hover:opacity-90 transition-opacity font-serif">
            ItsuTabi
          </Link>

          {/* Navigation Tabs */}
          {destinations.length > 0 && (
            <NavDropdown
              label="Destinations"
              categorizedItems={categorizedDestinationItems} // TRUYỀN DỮ LIỆU ĐÃ PHÂN LOẠI
              isOpen={openDropdown === 'destinations'}
              onToggle={() => setOpenDropdown(openDropdown === 'destinations' ? null : 'destinations')}
            />
          )}

          <Link
            to="/articles"
            className={`px-3 py-2 text-foreground hover:text-primary transition-colors ${
              location.pathname === '/articles' ? 'border-b-2 border-primary p-2.5' : ''
            }`}
          >
            Articles
          </Link>

          <Link
            to="/planning"
            className={`px-3 py-2 text-foreground hover:text-primary transition-colors ${
              location.pathname === '/planning' ? 'border-b-2 border-primary p-2.5' : ''
            }`}
          >
            Planning
          </Link>
        </div>

        {/* Right: Auth Tabs (Đã sửa chiều rộng và border) */}
        <div className="relative w-48">
          <button
            onClick={() => { setIsUserDropdownOpen(!isUserDropdownOpen); setOpenDropdown(null); }}
            className={`flex items-center justify-between w-full px-3 py-2 transition-colors rounded-lg 
              ${isUserDropdownOpen
                ? 'bg-accent text-accent-foreground border border-primary'
                : 'text-foreground border border-border hover:border-primary hover:text-primary'
              }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {isAuthenticated ? user?.name : 'Account'}
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isUserDropdownOpen && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={dropdownVariants}
                className="absolute right-0 mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50"
              >
                <div className="py-1">
                  {isAuthenticated ? (
                    <>
                      {user?.role === 'admin' ? (
                        <Link
                          to="/admin/profile"
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      ) : (
                        <Link
                          to="/user/profile"
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          My Profile
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/auth/login"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/auth/register"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  )
}