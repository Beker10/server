import Comment from "./comment.model.js";
import Post from "../posts/post.model.js";

export const createComment = async (req, res) => {
  try {
    const { text, post } = req.body;
    const authorId = req.uid;

    const comment = await Comment.create({
      text,
      post,
      author: authorId,
    });

    // Agregar el comentario al array de comentarios del post
    await Post.findByIdAndUpdate(post, {
      $push: { comments: comment._id }
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username name surname profilePicture')
      .populate('post', 'title');

    return res.status(201).json({
      message: "Comentario creado exitosamente",
      comment: populatedComment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al crear el comentario",
      error: error.message,
    });
  }
};