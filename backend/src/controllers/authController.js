const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
// Inscription
exports.register = async (req, res) => {
 try {
 const { username, email, password } = req.body;
 const existingUser = await User.findOne({ email });
 if (existingUser) return res.status(400).json({ error: 'Email déjà utilisé' });
 const hashedPassword = await bcrypt.hash(password, 10);
 const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
   res.status(201).json({ message: 'Utilisateur créé avec succès' });
 } catch (error) {
 res.status(500).json({ error: 'Erreur serveur' });
 }
};
// Connexion
exports.login = async (req, res) => {
 try {
 const { email, password } = req.body;
 const user = await User.findOne({ email });
 if (!user) return res.status(400).json({ error: 'Utilisateur introuvable' });

 const isPasswordValid = await bcrypt.compare(password, user.password);
 if (!isPasswordValid) return res.status(400).json({ error: 'Mot de passe incorrect' });
 const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
 res.json({ token, user: { _id: user._id, username: user.username, email:
user.email } });
 } catch (error) {
 res.status(500).json({ error: 'Erreur serveur' });
 }
};
