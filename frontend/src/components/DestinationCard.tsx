import { Link } from 'react-router-dom'

export default function DestinationCard({ dest }) {
  return (
    <div className="p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg hover:border-primary transition-all">
      <h3 className="font-semibold text-lg text-primary mb-1">
        <Link to={`/destinations/${dest.slug}`} className="hover:opacity-80 transition-opacity">{dest.title}</Link>
      </h3>
      <Link
        to={`/destinations/${dest.slug}`}
        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1"
      >
        View articles <span>→</span>
      </Link>
    </div>
  )
}
