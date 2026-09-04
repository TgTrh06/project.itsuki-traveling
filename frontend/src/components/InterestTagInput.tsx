import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import useInterestStore from '../store/interestStore'

export default function InterestTagInput({ value, onChange }) {
  const { interests, fetchInterests } = useInterestStore()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchInterests().catch(() => {})
  }, [fetchInterests])

  const toggleInterest = (interestId) => {
    if (value.includes(interestId)) {
      onChange(value.filter(id => id !== interestId))
    } else {
      onChange([...value, interestId])
    }
  }

  const selectedInterests = interests.filter(i => value.includes(i._id))

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-left flex items-center justify-between"
      >
        <span className="text-sm">
          {selectedInterests.length === 0
            ? 'Select interests...'
            : `${selectedInterests.length} selected`}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Selected Tags */}
      {selectedInterests.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedInterests.map(interest => (
            <div
              key={interest._id}
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold"
            >
              {interest.title}
              <button
                type="button"
                onClick={() => toggleInterest(interest._id)}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="max-h-48 overflow-y-auto">
            {interests.map(interest => (
              <button
                key={interest._id}
                type="button"
                onClick={() => {
                  toggleInterest(interest._id)
                  if (value.length + 1 === interests.length) {
                    setIsOpen(false)
                  }
                }}
                className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 transition-colors ${
                  value.includes(interest._id) ? 'bg-blue-100' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={value.includes(interest._id)}
                  readOnly
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
                <span className="text-sm text-gray-900">{interest.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
