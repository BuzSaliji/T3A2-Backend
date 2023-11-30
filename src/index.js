require('dotenv').config();

const { databaseConnect } = require('./database');
const { app } = require('./server'); // import the server


app.listen(3000, async () => {
    await databaseConnect(); // connect to the database
    console.log('Server running on port 3000');
});