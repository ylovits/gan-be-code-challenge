const express = require('express');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config()
const SERVER_PORT = process.env.SERVER_PORT;

const handleAuthentication = require('./server/middlewares/handleAuthentication.js');
const router = require('./server/routes/routes.js');

// Create and empy calculations.json file to "cache" the calculations
const calculationsJsonPath = path.resolve(__dirname, './server/db/calculations.json');
fs.ensureFileSync(calculationsJsonPath);
fs.writeFileSync(calculationsJsonPath, JSON.stringify({}, null, 2), 'utf-8');

const app = express();

// Handle authentication for all routes
app.use("*", handleAuthentication);

// Use the routes
app.use("/", router);

app.listen(SERVER_PORT, () => {
	console.log(`Server running on port ${SERVER_PORT}`);
});
