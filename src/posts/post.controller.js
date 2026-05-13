import Post from './post.model.js'
import User from '../users/user.model.js'
import Comment from '../comments/comment.model.js'

export const createPost = async (req, res) => {
    try {
        const { title, content } = req.body
        const authorId = req.uid

        const post = await Post.create({
            title,
            content,
            author: authorId
        })
        await User.findByIdAndUpdate(authorId, {
            $push: { posts: post._id }
        })

        const populatedPost = await Post.findById(post._id)
            .populate('author', 'name surname username profilePicture')
            .populate('comments')

        return res.status(201).json({
            message: 'Publicación exitosa',
            post: populatedPost
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error al guardar la publicación',
            error: error.message
        })
    }
}


export const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 8 } = req.query
        const skip = (page - 1) * limit

        const posts = await Post.find()
            .populate('author', 'name surname username profilePicture')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'name surname username profilePicture'
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))

        const totalPosts = await Post.countDocuments()
        return res.status(200).json({
            message: 'publicaciones obtenidas exitosamente',
            posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPosts,
                pages: Math.ceil(totalPosts / limit)

            }
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener las publicaciones',
            error: error.message
        })
    }
}
export const getPostsById = async (req, res) => {
    try {
        const { id } = req.params

        const post = await Post.findById(id)
            .populate('author', 'name surname username profilePicture')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'name surname username profilePicture'
                }
            })
        return res.status(200).json({
            message: 'Publicación obtenida exitosamente',
            post
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener la publicacion',
            error: error.message
        })
    }
}

export const reactToPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { emoji } = req.body;
        const userId = req.uid;

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: 'Publicación no encontrada' });

        // Remove existing reaction from this user if any
        post.reactions = post.reactions.filter(r => r.user.toString() !== userId);
        post.reactions.push({ user: userId, emoji });

        await post.save();
        res.status(200).json({ message: 'Reacción actualizada', reactions: post.reactions });
    } catch (error) {
        res.status(500).json({ message: 'Error al reaccionar', error: error.message });
    }
};