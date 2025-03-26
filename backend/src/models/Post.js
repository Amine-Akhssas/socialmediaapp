const mongoose = require('mongoose');
const PostSchema = new mongoose.Schema(
  {
    content: { type: String, required: true }, // Contenu du post
    image: { type: String }, // URL de l'image (optionnelle)
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    hashtags: [{ type: String }],
  },
  { timestamps: true },
);
module.exports = mongoose.model('Post', PostSchema);
