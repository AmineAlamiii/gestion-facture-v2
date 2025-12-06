const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-super-securise-changez-en-production';

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  // Récupérer le token depuis le header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token d\'authentification manquant' 
    });
  }

  // Vérifier le token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Token invalide ou expiré' 
      });
    }

    // Ajouter les informations de l'utilisateur à la requête
    req.user = user;
    next();
  });
};

// Fonction pour générer un token
const generateToken = (username) => {
  return jwt.sign(
    { username: username },
    JWT_SECRET,
    { expiresIn: '24h' } // Le token expire après 24 heures
  );
};

module.exports = {
  authenticateToken,
  generateToken
};

