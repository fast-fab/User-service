const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const getCordinates=require("../utils/userCordinates")
// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email},
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user.id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
});

// Signin route
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      message: "Signin successful",
      token,
      userId: user.id,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error signing in", error: error.message });
  }
});
router.post("/add-address", authMiddleware, async (req, res) => {
  try {
    const { address, pincode } = req.body;
    const user = req.user.id;
    
    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }
    
    if (!pincode) {
      return res.status(400).json({ error: "Pincode is required" });
    }
    
    const coordinate = await getCordinates(address, pincode);
    
    if (coordinate.error) {
      return res.status(400).json({ error: coordinate.error });
    }
    
    const addingDetails = await prisma.user.update({
      where: { id: user },
      data: { 
        Address: [address],
        pincode: Number(pincode),
        lat: coordinate.lat, 
        long: coordinate.lng 
      }
    });
    
    res.status(200).json({ message: "Address added successfully" });
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router

// Address   String[] //to add more than one address
// lang      String?
// long      String?