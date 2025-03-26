const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { addComment, deleteComment } = require('../controllers/commentController');
const router = express.Router();
router.post('/:postId', authenticate, addComment); // Ajouter un commentaire
router.delete('/:commentId', authenticate, deleteComment); // Supprimer un commentaire
module.exports = router;
