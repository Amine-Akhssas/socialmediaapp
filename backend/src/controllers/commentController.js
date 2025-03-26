const Comment = require('../models/Comment');
const Post = require('../models/Post');
// Ajouter un commentaire à un post
exports.addComment = async (req, res) => {
 try {
 const { postId } = req.params; const { text } = req.body; const userId =
req.user.userId;
 if (!text) return res.status(400).json({ error: 'Le commentaire ne peut pasêtre vide' });
 const post = await Post.findById(postId);
 if (!post) return res.status(404).json({ error: 'Post introuvable' });
 const comment = new Comment({ text, author: userId, post: postId });
 await comment.save();
 // add comment to the post
 post.comments.push(comment._id)
 await post.save()
 res.status(201).json(comment);
 } catch (error) {
 res.status(500).json({ error: 'Erreur serveur' });
 }
};
// Supprimer un commentaire (seulement par son auteur)
exports.deleteComment = async (req, res) => {
 try {
 const { commentId } = req.params;
 const userId = req.user.userId;
 const comment = await Comment.findById(commentId);
 if (!comment) return res.status(404).json({ error: 'Commentaire introuvable'
});
 if (comment.author.toString() !== userId) return res.status(403).json({ error:
'Action non autorisée' });
 await comment.deleteOne();
 res.json({ message: 'Commentaire supprimé avec succès' });
 } catch (error) {
 res.status(500).json({ error: 'Erreur serveur' });}
};
