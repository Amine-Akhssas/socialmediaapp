const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
// Suivre un utilisateur
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    if (userId === currentUserId)
      return res
        .status(400)
        .json({ error: 'Vous ne pouvez pas vous suivre vous-même' });
    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);
    if (!userToFollow || !currentUser)
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    if (currentUser.following.includes(userId))
      return res.status(400).json({
        error: 'Vous suivez déjà cet utilisateur',
      });
    currentUser.following.push(userId);
    userToFollow.followers.push(currentUserId);
    await currentUser.save();
    await userToFollow.save();
    res.json({ message: 'Utilisateur suivi avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
// Ne plus suivre un utilisateur
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);
    if (!userToUnfollow || !currentUser)
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userId,
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUserId,
    );
    await currentUser.save();
    await userToUnfollow.save();
    res.json({ message: 'Utilisateur désuivi avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
// Voir les abonnés d’un utilisateur
exports.getUserFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      'followers',
      'username avatar',
    );
    if (!user)
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
// Voir la liste des suivis d’un utilisateur
exports.getUserFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      'following',
      'username avatar',
    );
    if (!user)
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(user.following);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
// get user by id
exports.getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
// update user by id
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { username, avatar },
      {
        new: true,
      },
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
exports.getSuggestedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const suggestedUsers = await User.find({
      _id: { $nin: [...user.following, req.user.userId] },
    }).limit(5);
    res.json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate(
      'following',
      '_id',
    );
    if (!user)
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    const followingIds = user.following.map((f) => f._id.toString());
    // Fetch recent posts by followed users
    const posts = await Post.find({ author: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('author', 'username avatar');
    // Fetch recent likes on followed users' posts
    const likes = await Post.find({
      author: { $in: followingIds },
      likes: { $ne: [] },
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('likes', 'username avatar')
      .populate('author', 'username avatar');
    // Fetch recent comments on followed users' posts
    const comments = await Comment.find({
      post: { $in: posts.map((p) => p._id) },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('author', 'username avatar')
      .populate('post', 'content');
    // Fetch recent follows
    const follows = await User.find({ _id: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('followers', 'username avatar');
    // Fetch recent mentions (if any user was tagged in a post)
    const mentions = await Post.find({
      content: new RegExp(`@${user.username}`, 'i'),
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('author', 'username avatar');
    // Format the activities
    const activities = [
      ...posts.map((post) => ({
        _id: post._id,
        type: 'post',
        author: post.author,
        post: { content: post.content },
        createdAt: post.createdAt,
      })),
      ...likes.flatMap((post) =>
        post.likes.map((likeUser) => ({
          _id: `${post._id}-${likeUser._id}`,
          type: 'like',
          author: likeUser,
          post: { content: post.content },
          createdAt: post.updatedAt,
        })),
      ),
      ...comments.map((comment) => ({
        _id: comment._id,
        type: 'comment',
        author: comment.author,
        post: { content: comment.post.content },
        createdAt: comment.createdAt,
      })),
      ...follows.flatMap((user) =>
        user.followers.map((follower) => ({
          _id: `${user._id}-${follower._id}`,
          type: 'follow',
          author: follower,
          createdAt: user.createdAt,
        })),
      ),
      ...mentions.map((post) => ({
        _id: post._id,
        type: 'mention',
        author: post.author,
        post: { content: post.content },
        createdAt: post.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
