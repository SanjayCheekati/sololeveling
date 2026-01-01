const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '[SYSTEM] Access denied. No authentication token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '[SYSTEM] User not found. Authentication failed.'
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '[SYSTEM] Invalid token. Re-authentication required.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '[SYSTEM] Token expired. Please login again.'
      });
    }
    res.status(500).json({
      success: false,
      message: '[SYSTEM] Authentication error.'
    });
  }
};

// Check if user has required rank
const requireRank = (minRank) => {
  const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
  
  return (req, res, next) => {
    const userRankIndex = rankOrder.indexOf(req.user.rank);
    const requiredRankIndex = rankOrder.indexOf(minRank);
    
    if (userRankIndex < requiredRankIndex) {
      return res.status(403).json({
        success: false,
        message: `[SYSTEM] Insufficient rank. ${minRank}-Rank or higher required.`
      });
    }
    next();
  };
};

// Check if user can access a learning phase
const requirePhase = (requiredPhase) => {
  const phaseOrder = ['visualization', 'guided', 'autonomous'];
  
  return (req, res, next) => {
    const userPhaseIndex = phaseOrder.indexOf(req.user.currentPhase);
    const requiredPhaseIndex = phaseOrder.indexOf(requiredPhase);
    
    if (userPhaseIndex < requiredPhaseIndex) {
      return res.status(403).json({
        success: false,
        message: `[SYSTEM] Complete ${phaseOrder[requiredPhaseIndex - 1]} phase first.`
      });
    }
    next();
  };
};

module.exports = { auth, requireRank, requirePhase };
