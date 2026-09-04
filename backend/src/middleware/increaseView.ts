import { Blog } from '../models/blog.model.js';

const increaseView = async (req, res, next) => {
    const slug = req.params.slug;
    
    await Blog.findOneAndUpdate(
        { slug },
        { $inc: { 'meta.views': 1 } }
    );

    next(); // Call the next middleware or route handler
};

export default increaseView;