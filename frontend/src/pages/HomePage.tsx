import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { MapPin, Compass, FileText, Calendar } from "lucide-react"
import { useState } from "react"
import useDestinationStore from "../store/destinationStore"

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export default function HomePage() {
  const navigate = useNavigate()
  const { destinations } = useDestinationStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const matchedDestination = destinations.find(d => d.title.toLowerCase() === searchQuery.toLowerCase())
      if (matchedDestination) {
        navigate(`/destinations/${matchedDestination.slug}`)
      } else {
        navigate(`/destinations?search=${encodeURIComponent(searchQuery)}`)
      }
      setSearchQuery("")
      setShowSuggestions(false)
    }
  }

  const handleCityClick = (city) => {
    const destination = destinations.find(d => d.title.toLowerCase() === city.toLowerCase())
    if (destination) {
      navigate(`/destinations/${destination.slug}`)
    }
  }

  const handleSuggestionClick = (destination) => {
    navigate(`/destinations/${destination.slug}`)
    setSearchQuery("")
    setShowSuggestions(false)
  }

  const filteredSuggestions = searchQuery.trim()
    ? destinations.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
    : []

  const features = [
    {
      icon: MapPin,
      title: "Explore Destinations",
      description: "Discover Japan's most beautiful destinations from Tokyo to Hokkaido. Find hidden gems and popular landmarks.",
      link: "/destinations"
    },
    {
      icon: FileText,
      title: "Travel Articles",
      description: "Read detailed guides and travel tips from experienced travelers. Get inspired for your next adventure.",
      link: "/articles"
    },
    {
      icon: Calendar,
      title: "Plan Your Trip",
      description: "Create and customize your itinerary with our interactive planning tool. Optimize your route.",
      link: "/planning"
    },
    {
      icon: Compass,
      title: "Interests & Activities",
      description: "Filter by interests like culture, food, shopping, and more. Find exactly what you love.",
      link: "/interests"
    }
  ]

  const stats = [
    { number: "50+", label: "Destinations" },
    { number: "1000+", label: "Articles" },
    { number: "100K+", label: "Active Users" },
    { number: "47", label: "Prefectures" }
  ]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-background"
    >
      {/* Hero Section */}
      <section className="relative min-h-screen mt-20 pt-40 bg-gradient-to-br from-primary/10 via-background to-accent/5 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6 font-serif">
              Your Guide to Japan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Discover Japan's hidden treasures, from bustling cities to serene temples. Plan your perfect journey with Itsuki no Tabi.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12 relative"
          >
            <form onSubmit={handleSearch} className="flex gap-2 bg-card rounded-xl shadow-lg border border-border overflow-hidden">
              <input
                type="text"
                placeholder="Explore Japan's cities..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="flex-1 px-6 py-4 bg-card text-foreground placeholder-muted-foreground focus:outline-none text-lg"
              />
              <button type="submit" className="px-8 py-4 bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                Search
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50"
              >
                <div className="p-2">
                  {filteredSuggestions.map((destination) => (
                    <button
                      key={destination._id}
                      onClick={() => handleSuggestionClick(destination)}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 text-foreground"
                    >
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">{destination.title}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-16"
          >
            {['Tokyo', 'Kyoto', 'Osaka', 'Hokkaido', 'Okinawa'].map((city) => (
              <button
                key={city}
                onClick={() => handleCityClick(city)}
                className="px-5 py-2 rounded-full bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
              >
                {city}
              </button>
            ))}
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-card rounded-xl p-8 border border-border"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4 font-serif">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Itsuki no Tabi makes it easy to plan and explore Japan. Everything you need is in one place.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to={feature.link}
                  className="group h-full bg-card rounded-xl p-6 border border-border hover:border-primary hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground flex-1">{feature.description}</p>
                  <div className="mt-4 text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                    Explore →
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4 font-serif">Ready to Explore Japan?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Start planning your Japanese adventure today. Discover destinations, read travel guides, and create your perfect itinerary.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link
                to="/destinations"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                View Destinations
              </Link>
              <Link
                to="/planning"
                className="px-8 py-3 bg-card text-foreground border border-border rounded-lg font-semibold hover:border-primary transition-colors"
              >
                Start Planning
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
