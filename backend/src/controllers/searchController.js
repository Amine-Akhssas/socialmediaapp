const User = require('../models/User');
const Post = require('../models/Post');

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    const posts = await Post.find({ content: new RegExp(q, 'i') });
    const users = await User.find({ username: new RegExp(q, 'i') });
    res.json({ users, posts });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

