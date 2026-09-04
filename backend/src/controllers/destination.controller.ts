import { Destination } from "../models/destination.model.js";

// Get all
export const getAllDestinations = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);
        const skip = (page - 1) * limit;

        const total = await Destination.countDocuments();
        const destinations = await Destination.find()
            .populate('articles', '_id')
            .sort({ title: 1 })
            .skip(skip)
            .limit(limit);
        
        // Add article count to each destination
        const destinationsWithCount = destinations.map(dest => ({
            ...dest.toObject(),
            articleCount: dest.articles?.length || 0
        }));
        
        const pages = Math.ceil(total / limit) || 1;

        res.json({ data: destinationsWithCount, total, page, pages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get by slug
export const getDestinationBySlug = async (req, res) => {
    const { slug } = req.params;
    
    const destination = await Destination.findOne({ slug }).populate("articles");
    if (!destination) return res.status(404).json({ message: "Not found" });

    res.json(destination);
};

// Update
export const updateDestination = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Destination.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Destination not found" });
        
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};