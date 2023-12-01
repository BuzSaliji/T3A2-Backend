require('dotenv').config();

const { databaseConnect } = require('./database');
const { app } = require('./server'); // import the server


// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
	await databaseConnect();
	console.log("Server running!");
});