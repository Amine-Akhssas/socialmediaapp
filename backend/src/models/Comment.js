const mongoose = require('mongoose');
const CommentSchema = new mongoose.Schema({
 text: { type: String, required: true }, // Contenu du commentaire
 author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, //Auteur du commentaire
 post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true } // Postassocié
}, { timestamps: true });
module.exports = mongoose.model('Comment', CommentSchema);
