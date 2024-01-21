require('dotenv').config();
const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, matchedData, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middlewares/fetchUser');

// ROUTE 1: Create a user using: POST "/auth/createuser". No login required
router.post('/createuser', [
    body("name", 'Enter a valid name').isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
], async (req, res) => {
    // Check if there are errors, return Bad request and errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const data = matchedData(req);

        // Check if user with entered email already exists
        let user = await User.findOne({ email: data.email });
        if (user) {
            return res.status(400).json({ error: "User already exists!" });
        }

        // Creating a secure password hash usnig salt
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(data.password, salt);

        // Creating a new user
        user = await User.create({
            name: data.name,
            email: data.email,
            password: secPass,
        });
        const tokenData = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(tokenData, process.env.JWT_SECRET);

        res.json({ authToken });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE 2: Authenticate a user using: POST "/auth/login". No login required
router.post("/login", [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: "Invalid credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);

        if (!passwordCompare) {
            return res.status(400).json({ errors: "Invalid credentials" });
        }

        const payload = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(payload, process.env.JWT_SECRET);

        res.json({ authToken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE 3: Fetch a user using: POST "/api/auth/getuser". login required
// router.post("/getuser", fetchuser, async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const user = await User.findById(userId).select("-password");
//         res.send(user);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send("Internal server error");
//     }
// })

module.exports = router

