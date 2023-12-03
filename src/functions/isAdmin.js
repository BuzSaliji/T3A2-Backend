const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next(); // User is an admin, proceed to the next middleware
    } else {
        res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
};

module.exports = isAdmin;