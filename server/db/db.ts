import { Pool } from "postgres";
import { ParsedPostgresNumbers, parseNumericFields } from "../utils/utils.ts";
import stream from 'node:stream';

export type QueryStreamResponse = { status: number; body: stream.Readable | { message: string; }; }

export default class DB {

	private static _instance: DB;

	private pool: Pool;

	static get instance() {
		if (!DB._instance) {
			DB._instance = new DB();
		}
		return DB._instance;
	}


	constructor() {
		this.pool = new Pool({
			hostname: Deno.env.get("HOST"),
			port: Deno.env.get("POSTGRES_PORT"),
			user: Deno.env.get("POSTGRES_USER"),
			password: Deno.env.get("POSTGRES_PASSWORD"),
			database: Deno.env.get("POSTGRES_DB"),
		}, 5);
	}

	// Generic query function
	async query<T>(query: string, args?: unknown[]): Promise<ParsedPostgresNumbers<T>[]> {
		const client = await this.pool.connect();
		try {
			const result = args?.length
				? await client.queryObject<T>(query, args)
				: await client.queryObject<T>(query);

			return result.rows.map(parseNumericFields<T>);
		} finally {
			client.release()
		}
	}

	// Query for a single row
	async queryOne<T>(query: string, args?: unknown[]): Promise<ParsedPostgresNumbers<T> | null> {
		const result = await this.query<T>(query, args);
		return result.length > 0 ? result[0] : null;
	}

	// Query with streaming 
	async queryStream<T>(query: string, args?: unknown[]): Promise<QueryStreamResponse> {

		// Create a PassThrough stream to allow readable and writable functionality
		const writable = new stream.PassThrough();
		await writable.write("[");
		let isFirst = true;
		const chunkSize = 1000;

		let response: QueryStreamResponse = { status: 202, body: { message: "pending" } };

		try {

			let offset = 0;
			let rows;

			do {
				const queryProgress = [`${chunkSize}`, `${offset}`];
				const queryProgressString = `
					${query.trim().endsWith(";") ? query.trim().slice(0, -1) : query} /* If the last character is a semicolon, remove it */
					/* Set the limit and offset respecting the number of arguments */
					LIMIT $${args?.length ? args.length + 1 : 1}
					OFFSET $${args?.length ? args.length + 2 : 2}
				`;

				const argsArray = args ? [...args, ...queryProgress] : queryProgress;
				rows = await this.query<T>(
					queryProgressString,
					argsArray
				);

				for (const row of rows) {
					if (!isFirst) {
						await writable.write(",");
					} else {
						isFirst = false;
					}

					// Write each row as JSON
					await writable.write(JSON.stringify(row));
				}

				offset += chunkSize;
			} while (rows.length === chunkSize);
			response = { status: 200, body: writable };

		} catch (error) {

			await writable.destroy(error as Error);
			response = { status: 500, body: { message: "Error streaming" } };

		} finally {
			await writable.write("]"); // End JSON array
			await writable.end();
		}

		return response;
	}
}