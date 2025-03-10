const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client");
const { AuthError } =require('../../src/utils/errors.js');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new AuthError('Seller not found');
      }
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthError('Token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AuthError('Invalid token');
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports=authMiddleware