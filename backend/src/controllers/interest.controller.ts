import { Interest } from "../models/interest.model.js"

export const getAllInterests = async (req, res) => {
  try {
    const interests = await Interest.find().sort({ createdAt: -1 })
    res.status(200).json(interests)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getInterestBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const interest = await Interest.findOne({ slug })

    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' })
    }

    res.status(200).json(interest)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createInterest = async (req, res) => {
  try {
    const { title, slug } = req.body

    if (!title || !slug) {
      return res.status(400).json({ message: 'Title and slug are required' })
    }

    const interest = await Interest.create({ title, slug })
    res.status(201).json({ success: true, interest })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const updateInterest = async (req, res) => {
  try {
    const { id } = req.params
    const { title, slug } = req.body

    if (!title || !slug) {
      return res.status(400).json({ message: 'Title and slug are required' })
    }

    const interest = await Interest.findByIdAndUpdate(
      id,
      { title, slug },
      { new: true, runValidators: true }
    )

    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' })
    }

    res.status(200).json({ success: true, interest })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const deleteInterest = async (req, res) => {
  try {
    const { id } = req.params

    const interest = await Interest.findByIdAndDelete(id)

    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' })
    }

    res.status(200).json({ success: true, message: 'Interest deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
