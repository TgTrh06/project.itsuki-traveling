import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown, FileText, Users, MapPin, Zap } from 'lucide-react'

export default function AdminLayout({ children }) {
  const [openSection, setOpenSection] = useState('articles')

  const sections = [
    {
      key: 'articles',
      title: 'Articles',
      icon: FileText,
      items: [
        { title: 'All Articles', to: '/admin/articles' },
        { title: 'Create Article', to: '/admin/articles/create' }
      ]
    },
    {
      key: 'users',
      title: 'Users',
      icon: Users,
      items: [
        { title: 'All Users', to: '/admin/users' }
      ]
    },
    {
      key: 'destinations',
      title: 'Destinations',
      icon: MapPin,
      items: [
        { title: 'All Destinations', to: '/admin/destinations' },
      ]
    },
    {
      key: 'plans',
      title: 'Plans',
      icon: Users,
      items: [
        { title: 'View User Plans', to: '/admin/plans' }
      ]
    },
    {
      key: 'interests',
      title: 'Interests',
      icon: Zap,
      items: [
        { title: 'View All', to: '/admin/interests' },
        { title: 'Create / Edit', to: '/admin/interests/manage' }
      ]
    }
  ]

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3 bg-white rounded-lg shadow-md p-4 sticky top-28 h-fit">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Admin Panel</h3>
            <p className="text-sm text-gray-500">Manage site content and users</p>
          </div>

          <nav className="space-y-2">
            {sections.map(sec => (
              <div key={sec.key}>
                <button
                  onClick={() => setOpenSection(openSection === sec.key ? null : sec.key)}
                  className="flex items-center justify-between w-full px-2 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <sec.icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">{sec.title}</span>
                  </div>
                  <div>
                    {openSection === sec.key ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </button>

                {openSection === sec.key && (
                  <div className="mt-2 ml-8 space-y-1">
                    {sec.items.map(it => (
                      <Link key={it.to} to={it.to} className="block text-sm text-gray-700 px-2 py-1 rounded hover:bg-blue-50">{it.title}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <main className="lg:col-span-9">
          <div className="bg-white rounded-lg shadow-md p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
