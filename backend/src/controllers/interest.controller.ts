import { Interest } from "../models/interest.model.js"
import type { Request, Response } from "express"

const messageOf = (error: unknown) => error instanceof Error ? error.message : "Unexpected error"

export const getAllInterests = async (_req: Request, res: Response) => {
  try {
    const interests = await Interest.find().sort({ createdAt: -1 })
    res.status(200).json(interests)
  } catch (error) {
    res.status(500).json({ message: messageOf(error) })
  }
}

export const getInterestBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params
    const interest = await Interest.findOne({ slug })

    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' })
    }

    res.status(200).json(interest)
  } catch (error) {
    res.status(500).json({ message: messageOf(error) })
  }
}

export const createInterest = async (req: Request, res: Response) => {
  try {
    const { title, slug } = req.body

    if (!title || !slug) {
      return res.status(400).json({ message: 'Title and slug are required' })
    }

    const interest = await Interest.create({ title, slug })
    res.status(201).json({ success: true, interest })
  } catch (error) {
    res.status(400).json({ message: messageOf(error) })
  }
}

export const updateInterest = async (req: Request, res: Response) => {
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
    res.status(400).json({ message: messageOf(error) })
  }
}

export const deleteInterest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const interest = await Interest.findByIdAndDelete(id)

    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' })
    }

    res.status(200).json({ success: true, message: 'Interest deleted' })
  } catch (error) {
    res.status(500).json({ message: messageOf(error) })
  }
}
