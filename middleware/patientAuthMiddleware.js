const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const patientAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization header missing or malformed',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'PATIENT') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Patient role required',
      });
    }

    req.patient = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    let message = 'Invalid token';
    if (error.name === 'TokenExpiredError') {
      message = 'Token expired';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token: ' + error.message;
    }

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

module.exports = patientAuthMiddleware;
