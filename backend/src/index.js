require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const searchRoutes = require('./routes/searchRoutes');
const app = express();
const PORT = process.env.PORT || 5000;
// Connexion à MongoDB

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(' MongoDB connecté'))
  .catch((err) => console.error(' Erreur de connexion à MongoDB:', err));
// Middlewares globaux
// Increase request body size limit
app.use(express.json({ limit: '50mb' })); // Adjust size as needed
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.get('/', (req, res) => {
  res.send('Bienvenue sur l’API du réseau social !');
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);

// Lancer le serveur
app.listen(PORT, () => console.log(` Serveur démarré sur le port ${PORT}`));
