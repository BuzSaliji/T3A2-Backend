// import Express library
const express = require('express');
const { User } = require('../models/UserModel');
const { comparePassword, generateJwt } = require('../functions/userAuthFunctions');
const authMiddleware = require('../middleware/authMiddleware');

// make an instance of a Router
const router = express.Router();

// import the User model


router.get("/", async (request, response) => {
    try {
        let result = await User.find({});
        response.json({ result });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});


// GET localhost:3000/users/laijhjsdaljfdhbsal
router.get("/:id", async (request, response) => {
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
router.post("/", async (request, response) => {
    try {
        let newUser = await User.create(request.body);
        response.status(201).json(newUser);
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
});


// POST localhost:3000/users/login
// request.body = {username: "admin", password: "Password1"}
// respond with {jwt: "laskdnalksfdnal;fgvkmsngb;sklnmb", valid: true}
router.post("/login", async (request, response) => {
        // Find user by provided username 
	let targetUser = await User.findOne({username: request.body.username}).catch(error => error);

	// Check if user provided the correct password
	let isPasswordCorrect = await comparePassword(request.body.password, targetUser.password);

	if (!isPasswordCorrect){
		response.status(403).json({error:"You are not authorised to do this!"});
	}

	// If they provided the correct, generate a JWT
	let freshJwt = generateJwt(targetUser._id.toString());

	// respond with the JWT 
	response.json({
		jwt: freshJwt
	});
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
        const requestingUser = request.user; // Assuming `request.user` is set by a middleware

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
        const requestingUser = request.user; // Assuming `request.user` is set by a middleware

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

router.post("/register", async (request, response) => {
    try {
        const { username, email, password } = request.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return response.status(400).json({ error: "Username or email already in use" });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // Generate JWT
        const jwt = generateJwt(newUser._id.toString());

        response.status(201).json({ jwt });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

// Search by username
router.get("/search/username", async (request, response) => {
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
router.get("/search/email", async (request, response) => {
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