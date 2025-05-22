const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma'); // adjust path as needed

module.exports = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');  
      
      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          student: {
            select: {
              id: true,
              rollNumber: true,
              currentSemester: true,
              branchId: true
            }
          },
          teacher: {
            select: {
              id: true,
              employeeId: true
            }
          },
          admin: {
            select: {
              id: true
            }
          }
        }
      });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Check if user role is allowed
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
      }

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};