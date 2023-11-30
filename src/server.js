const express = require('express');

// make server instance
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    express.response.json({ message: "Hello World" });
});

module.exports = { app }