import DB from "./db/db.ts";
import { Address } from "./interfaces.ts";

// Function to create the addresses table and insert data into PostgreSQL
const insertAddresses = async (data: Address[]) => {
	const db = await DB.instance;
	try {

		// Check if the table exists
		const checkTable = await db.query(`SELECT EXISTS ( SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'addresses' );`);
		console.log("Checking if the addresses table already exists");
		if ((checkTable[0] as { exists: boolean }).exists) {
			const result = await db.query(`SELECT COUNT(*) FROM addresses;`);
			console.log('Addresses table already exists.');
			console.log(`With ${(result[0] as { count: number }).count} addresses.`);
			return;
		}

		// Create the table if it doesn't exist
		console.log("Creating the addresses table");
		await db.query(`
			CREATE TABLE IF NOT EXISTS addresses (	guid UUID PRIMARY KEY,	isActive BOOLEAN,	address TEXT,	latitude NUMERIC(8, 6),	longitude NUMERIC(9, 6),	tags TEXT[]);
		`);

		// Insert each item into the table
		console.log("Inserting data into the addresses table. THIS WILL TAKE A WHILE.");
		console.log("Total addresses to insert:", data.length);
		let count = 0;
		const interval = setInterval(() => {
			console.log(
				count < 5 ?
					[
						"This will take ~ 5 minutes. ~4 to go. Please don't stop the process.",
						"Still inserting data.",
						"It is a long process.",
						"Wow it takes a while...",
						"It's been 5 minutes, but it is still populating the database. Be patient.",
						"Don't kill it, Almost there!"
					][count] :
					"OK! This is taking longer than expected."
			);
			count++;

		}, 1 * 60 * 1000);

		for (const item of data) {

			await db.query(`
				INSERT INTO addresses (guid, isActive, address, latitude, longitude, tags)
				VALUES ($1, $2, $3, $4, $5, $6)
				ON CONFLICT (guid) DO NOTHING;
			`,
				[
					item.guid,
					item.isActive,
					item.address,
					item.latitude,
					item.longitude,
					item.tags
				]);
		}

		clearInterval(interval);

		const result = await db.query(`SELECT COUNT(*) FROM addresses;`);
		console.log(`Inserted ${(result[0] as { count: number }).count} addresses into the database.`);

		// Create the area_calculations table if it doesn't exist.
		console.log("Creating the area_calculations table");
		await db.query(`
			CREATE TABLE IF NOT EXISTS area_calculations (
				id UUID PRIMARY KEY,
				address_id UUID,
				distance NUMERIC,
				status TEXT DEFAULT 'PENDING',
				result JSONB
			);
		`);

		// Enable the cube and earthdistance extensions
		// https://www.postgresql.org/docs/current/earthdistance.html
		// https://www.postgresql.org/docs/current/cube.html
		console.log("Enabling the cube and earthdistance extensions");
		await db.query(`CREATE EXTENSION IF NOT EXISTS cube;`);
		await db.query(`CREATE EXTENSION IF NOT EXISTS earthdistance;`);

		console.log('Database initialized successfully.');

	} catch (error) {
		console.error('Error inserting data:', error);
	}
}

// Function to fetch JSON data from the remote URL and initialize the database with it
const initializeDb = async () => {

	// Fetch JSON data from the remote URL
	console.log('Fetching data from remote URL:', "https://raw.githubusercontent.com/gandevops/backend-code-challenge/master/addresses.json");
	const response = await fetch("https://raw.githubusercontent.com/gandevops/backend-code-challenge/master/addresses.json");
	if (!response.ok) {
		throw new Error(`Failed to fetch data: ${response.statusText}`);
	}

	const addresses = await response.json();
	await insertAddresses(addresses);
}

export default initializeDb;