const express = require('express');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config()
const SERVER_PORT = process.env.SERVER_PORT;

// Fetch JSON data from the remote URL
fetch('https://raw.githubusercontent.com/gandevops/backend-code-challenge/refs/heads/master/addresses.json')
	.then(async response => {

		if (!response.ok) {
			throw new Error(`Failed to fetch data: ${response.statusText}`);
		}

		// Copy remote addresses.json to populate the local "db"
		const localAddressesJsonPath = path.resolve(__dirname, './server/db/addresses.json');
		const addresses = await response.text();
		fs.ensureFileSync(localAddressesJsonPath);
		fs.writeFileSync(localAddressesJsonPath, addresses, 'utf-8');

	}).then(() => {

		const { loadRemoteScript } = require('./client/client.js');
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

		// Exit the process when the challenge is completed
		const originalWrite = process.stdout.write;
		process.stdout.write = function (chunk, ...args) {
			originalWrite.call(this, chunk, ...args);

			const message = chunk.toString();
			if (message.includes('You made it! Now make your code available on git and send us a link')) {
				console.log('\x1b[32m%s\x1b[0m',"=========\nChallenge completed! Exiting process\n=========");
				setTimeout(process.exit(0), 1000);
			}

		};

		app.listen(SERVER_PORT, () => {
			// After the server starts, load the remote script and run it
			console.log('\x1b[36m%s\x1b[0m',"Challenge accepted!");
			loadRemoteScript();
		});

	}).catch(error => {
		console.error("Error fetching addresses.json", error);
	});