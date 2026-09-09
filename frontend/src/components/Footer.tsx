import { Link } from 'react-router-dom'
import { Facebook, Twitter, Youtube, Instagram, Rss } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Interests',
      links: [
        { label: 'Accommodation', href: '/interests?search=accommodation' },
        { label: 'Activities', href: '/interests?search=activities' },
        { label: 'Beauty & Spa', href: '/interests?search=beauty' },
        { label: 'Culture', href: '/interests?search=culture' },
        { label: 'Food', href: '/interests?search=food' },
        { label: 'Nightlife', href: '/interests?search=nightlife' },
        { label: 'Shopping', href: '/interests?search=shopping' },
        { label: 'Transportation', href: '/interests?search=transportation' }
      ]
    },
    {
      title: 'Explore',
      links: [
        { label: 'Destinations', href: '/destinations' },
        { label: 'Articles', href: '/articles' },
        { label: 'Plan a Trip', href: '/planning' },
        { label: 'Features', href: '#' },
        { label: 'Guides', href: '#' },
        { label: 'Map', href: '#' },
        { label: 'News', href: '#' },
        { label: 'Videos', href: '#' }
      ]
    },
    {
      title: 'About',
      links: [
        { label: 'About us', href: '#' },
        { label: 'Advertise', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Company', href: '#' },
        { label: 'Sustainability', href: '#' },
        { label: 'Intern', href: '#' },
        { label: 'Travel Agency', href: '#' },
        { label: 'B2B Partners', href: '#' }
      ]
    },
    {
      title: 'Destinations',
      links: [
        { label: 'Hokkaido', href: '/destinations?filter=hokkaido' },
        { label: 'Tokyo', href: '/destinations?filter=tokyo' },
        { label: 'Kyoto', href: '/destinations?filter=kyoto' },
        { label: 'Osaka', href: '/destinations?filter=osaka' },
        { label: 'Kobe', href: '/destinations?filter=kobe' },
        { label: 'Hiroshima', href: '/destinations?filter=hiroshima' },
        { label: 'Okinawa', href: '/destinations?filter=okinawa' },
        { label: 'All destinations', href: '/destinations' }
      ]
    }
  ]

  return (
    <footer className="bg-card text-foreground mt-20 border-t border-border border-primary border-2">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {footerSections.map((section, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-border pt-8 mb-8">
          <div className="max-w-md">
            <h4 className="font-semibold text-foreground mb-3">Get newsletter</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your e-mail address"
                className="flex-1 px-4 py-2 bg-background border border-border rounded text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded font-semibold hover:opacity-90 transition-opacity text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-muted-foreground">
            <p>Itsuki no Tabi is the leading resource for Japan travel information and the primary destination for visitors planning and traveling to Japan.</p>
          </div>
          
          {/* Social Icons */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Rss className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-muted border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="space-x-4">
            <Link to="#" className="hover:text-primary transition-colors">Help</Link>
            <span>|</span>
            <Link to="#" className="hover:text-primary transition-colors">Contact</Link>
            <span>|</span>
            <Link to="#" className="hover:text-primary transition-colors">Terms</Link>
            <span>|</span>
            <Link to="#" className="hover:text-primary transition-colors">Privacy</Link>
            <span>|</span>
            <Link to="#" className="hover:text-primary transition-colors">Copyright</Link>
          </div>
          <div>© {currentYear} Itsuki no Tabi</div>
        </div>
      </div>
    </footer>
  )
}
