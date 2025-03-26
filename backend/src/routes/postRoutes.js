const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const {
  createPost,
  deletePost,
  likePost,
  getAllPosts,
  getUserPosts,
  getFeed,
  getTrendingTopics,
} = require('../controllers/postController');
const router = express.Router();
router.post('/', authenticate, createPost); // Créer un post
router.delete('/:postId', authenticate, deletePost); // Supprimer un post
router.put('/:postId/like', authenticate, likePost); // Liker un post
router.get('/user/:userId/', authenticate, getUserPosts); // Liker un post
router.get('/feed', authenticate, getFeed);
router.get('/trending/topics', getTrendingTopics);
router.get('/', getAllPosts); // Récupérer tous les posts
module.exports = router;
