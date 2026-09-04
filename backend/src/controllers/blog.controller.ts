import { Blog } from "../models/blog.model.js";
import { User } from "../models/user.model.js";

export const getAllBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        const query = {};

        console.log(req.query);

        const cat = req.query.cat;
        const creator = req.query.creator;
        const searchQuery = req.query.search;
        const sortQuery = req.query.sort;
        const published = req.query.published;

        if (cat) {
            query.category = cat;
        }

        if (searchQuery) {
            query.title = { $regex: searchQuery, $options: "i" };
        }

        if (creator) {
            const author = await User.findOne({ username: creator }).select("_id");
            
            if (!author) {
                return res.status(404).json({ success: false, message: "No blog found!" });
            }

            query.author = author._id;
        }

        let sortObj = { createdAt: -1 };

        if (sortQuery) {
            switch (sortQuery) {
                case "newest":
                    sortObj = { createdAt: -1 };
                    break;
                case "oldest":
                    sortObj = { createdAt: 1 };
                    break;
                case "popular":
                    sortObj = { "meta.views": -1 };
                    break;
                case "trending":
                    sortObj = { "meta.views": -1 };
                    query.createdAt = {
                        $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
                    };
                    break;
                default:
                    break;
            }
        }

        // Show only published blogs unless specifically requested
        if (published === "true") {
            query.isPublished = true;
        }

        const [blogs, total] = await Promise.all([
            Blog.find(query)
                .populate("author", "username")
                .sort(sortObj)
                .skip(skip)
                .limit(limit),
            Blog.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            message: "Blogs retrieved successfully",
            data: {
                blogs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                    hasMore: page * limit < total
                }
            }
        });
    } catch (error) {
        console.log("Error in getAllBlogs: ", error);
        res.status(500).json({
            success: false,
            message: "Error in getting all blogs",
            error: error.message,
        });
    }
};

export const getBlog = async (req, res) => {
    try {
        const param = req.params.slug;
        let blog = null;

        // If param is a valid ObjectId, try findById first (frontend may pass _id)
        if (param && /^[0-9a-fA-F]{24}$/.test(param)) {
            blog = await Blog.findById(param).populate('author', 'username email');
        }

        // Fallback: try find by slug
        if (!blog) {
            blog = await Blog.findOne({ slug: param }).populate('author', 'username email');
        }

        console.log('Found blog:', blog);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // NOTE: view increment is handled by `increaseView` middleware which supports id or slug.

        res.status(200).json({
            success: true,
            message: 'Blog retrieved successfully',
            data: { blog }
        });
    } catch (error) {
        console.log('Error in getBlog: ', error);
        return res.status(500).json({
            success: false,
            message: 'Error in getting a single blog',
            error: error.message,
        });
    }
};