const jwt = require('jsonwebtoken');

// CRITICAL: Validate JWT_SECRET on module load
if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        valid: false,
        error: 'No token provided',
        type: 'NO_TOKEN',
        timestamp: new Date().toISOString()
      });
    }

    // No fallback - JWT_SECRET is validated on startup
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        valid: false,
        error: 'Token has expired',
        type: 'TOKEN_EXPIRED',
        timestamp: new Date().toISOString()
      });
    }
    res.status(401).json({ 
      success: false,
      valid: false,
      error: 'Invalid token',
      type: 'INVALID_TOKEN',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = auth;
