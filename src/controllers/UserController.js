// import Express library
const express = require('express');
const { User } = require('../models/UserModel');
const { comparePassword, generateJwt } = require('../functions/userAuthFunctions');
const authMiddleware = require('../functions/authMiddleware');

// make an instance of a Router
const router = express.Router();

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};


// GET all users (Admin only)
router.get('/', authMiddleware, async (req, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied.' });
    }
  
    const users = await User.find({});
    res.json(users);
  });

// GET localhost:3000/users/laijhjsdaljfdhbsal
router.get("/:id", authMiddleware, isAdmin, async (request, response) => {
    try {
        let result = await User.findOne({ _id: request.params.id });
        if (result) {
            response.json({ result });
        } else {
            response.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});


// POST localhost:3000/users/
router.post("/", authMiddleware, async (request, response) => {
    try {
        let newUser = await User.create(request.body);
        response.status(201).json(newUser);
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
});


// POST localhost:3000/users/login
// request.body = {identifier: "admin", password: "Password1"}
// respond with {jwt: "laskdnalksfdnal;fgvkmsngb;sklnmb", valid: true}
router.post("/login", async (request, response) => {
    try {
        let { username, email, password } = request.body;
        let query = {};

        if (email) {
            query.email = email;
        } else if (username) {
            query.username = username;
        } else {
            return response.status(400).json({ error: "Username or email required" });
        }

        // Find user by username or email
        let targetUser = await User.findOne(query);

        if (!targetUser) {
            return response.status(404).json({ error: "User not found" });
        }

        // Check if user provided the correct password
        let isPasswordCorrect = await comparePassword(password, targetUser.password);

        if (!isPasswordCorrect) {
            return response.status(403).json({ error: "Invalid password" });
        }

        // If they provided the correct password, generate a JWT
        let freshJwt = generateJwt(targetUser._id.toString());

        // Respond with the JWT 
        response.json({ jwt: freshJwt });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});




// GET localhost:3000/users/verify
// JWT in request.headers["jwt"] or request.headers["authorization"]
// respond with {jwt: "laskdnalksfdnal;fgvkmsngb;sklnmb", valid: true}
router.get("/verify", async (request, response) => {
    try {
        const token = request.headers['jwt'] || request.headers['authorization'];
        if (!token) {
            return response.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        response.json({ jwt: token, valid: true });
    } catch (error) {
        response.status(400).json({ error: "Invalid token" });
    }
});


// GET localhost:3000/users/regenerate
// JWT in request.headers["jwt"] or request.headers["authorization"]
// respond with {jwt: "laskdnalksfdnal;fgvkmsngb;sklnmb", valid: true}
router.get("/regenerate", async (request, response) => {
    try {
        const token = request.headers['jwt'] || request.headers['authorization'];
        if (!token) {
            return response.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const newJwt = generateJwt(decoded.userID);

        response.json({ jwt: newJwt });
    } catch (error) {
        response.status(400).json({ error: "Invalid token" });
    }
});


// DELETE localhost:3000/users/fghfdfds
router.delete("/:id", authMiddleware, async (request, response) => {
    try {
        const userId = request.params.id;
        const requestingUser = request.user;

        // Check if the requesting user is the owner or an admin
        if (requestingUser.id !== userId && !requestingUser.isAdmin) {
            return response.status(403).json({ error: "Unauthorized" });
        }

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return response.status(404).json({ error: "User not found" });
        }
        response.json({ message: "User deleted successfully" });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});



// PATCH localhost:3000/users/fghfdfds
router.patch("/:id", authMiddleware, async (request, response) => {
    try {
        const userId = request.params.id;
        const requestingUser = request.user;

        // Check if the requesting user is the owner or an admin
        if (requestingUser.id !== userId && !requestingUser.isAdmin) {
            return response.status(403).json({ error: "Unauthorized" });
        }

        const updates = request.body;
        const user = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!user) {
            return response.status(404).json({ error: "User not found" });
        }
        response.json(user);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
})

// PATCH update user role (Admin only)
router.patch('/:id/role', async (req, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied.' });
    }
  
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(user);
  });


// Search by username
router.get("/search/username", authMiddleware, isAdmin, async (request, response) => {
    try {
        const { username } = request.query;
        if (!username) {
            return response.status(400).json({ error: "Username query parameter is required" });
        }

        const user = await User.findOne({ username: username });
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        response.json(user);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

// Search by email
router.get("/search/email", authMiddleware, isAdmin, async (request, response) => {
    try {
        const { email } = request.query;
        if (!email) {
            return response.status(400).json({ error: "Email query parameter is required" });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        response.json(user);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

module.exports = router;