const jwt = require('jsonwebtoken');

function auth(required = true) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      if (!required) return next();
      return res.status(401).json({ message: 'Missing token' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
      req.user = decoded;
      next();
    } catch (e) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

module.exports = { auth };
