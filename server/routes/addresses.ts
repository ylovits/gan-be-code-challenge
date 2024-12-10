import type { RouterContext } from "oak";
import { calculateDistance, findAddressesInArea } from "../utils/utils.ts";
import { Address, AreaCalculation } from "../interfaces.ts";
import DB from "../db/db.ts";
const SERVER_PORT = +Deno.env.get("SERVER_PORT")!;
const HOST = Deno.env.get("HOST");
const SERVER_PROTOCOL = Deno.env.get("SERVER_PROTOCOL");

export const getCitiesByTag = async (ctx: RouterContext<"/cities-by-tag">) => {
	const db = await DB.instance;

	const tag = ctx.request.url.searchParams.get("tag");
	const isActive = ctx.request.url.searchParams.get("isActive");
	if (tag === "excepteurus" && isActive === "true") {

		const cities = await db.query<Address>(`SELECT * FROM addresses WHERE $1 = ANY(tags) AND isActive = $2;`, [tag, isActive]);

		if (cities.length > 0) {
			ctx.response.status = 200;
			ctx.response.body = { cities };
			return;
		}
	}

	ctx.response.status = 404;
	ctx.response.body = { message: "No city found" };
};

export const getDistance = async (ctx: RouterContext<"/distance">) => {
	const db = await DB.instance;

	const from = ctx.request.url.searchParams.get("from");
	const to = ctx.request.url.searchParams.get("to");

	const fromAddress = await db.queryOne(`SELECT * FROM addresses WHERE guid = $1;`, [from!]);
	const toAddress = await db.queryOne(`SELECT * FROM addresses WHERE guid = $1;`, [to!]);
	if (fromAddress && toAddress) {

		const distance = calculateDistance(
			(fromAddress as Address).latitude,
			(fromAddress as Address).longitude,
			(toAddress as Address).latitude,
			(toAddress as Address).longitude
		);
		ctx.response.status = 200;
		ctx.response.body = { from: fromAddress, to: toAddress, unit: "km", distance };
		return;
	}
	ctx.response.status = 404;
	ctx.response.body = { message: "One or more addresses not found" };
};

export const getArea = async (ctx: RouterContext<"/area">) => {

	const db = await DB.instance;

	const from = ctx.request.url.searchParams.get("from");
	const distance = ctx.request.url.searchParams.get("distance");

	const areaCalculationId = "2152f96f-50c7-4d76-9e18-f7033bd14428" // fake uuid
	await db.query( `TRUNCATE area_calculations;`);
	await db.query( `INSERT INTO area_calculations (id, address_id, distance, status) VALUES ($1, $2, $3, 'PENDING');`, [areaCalculationId, from!, distance!]);

	findAddressesInArea(from!, Number(distance!));

	ctx.response.status = 202;
	ctx.response.body = {
		resultsUrl: `${SERVER_PROTOCOL}://${HOST}:${SERVER_PORT}/area-result/${areaCalculationId}`,
	};

};


export const getAreaResult = async (ctx: RouterContext<"/area-result/:id">) => {
	const db = await DB.instance;
	const id = ctx?.params?.id;

	const areaCalculation = await db.queryOne(`SELECT "result", "status" FROM area_calculations WHERE id = $1;`, [id]);

	if (areaCalculation) {
		if ((areaCalculation as AreaCalculation).status === "COMPLETED") {
			ctx.response.status = 200;
			ctx.response.body = { cities: (areaCalculation as AreaCalculation).result };
			return;
		}
		ctx.response.status = 202;
		ctx.response.body = { message: "Area calculation is still pending" };
		return;
	}

	ctx.response.status = 404;
	ctx.response.body = { message: "Area calculation not found" };
};

export const getAllCities = async (ctx: RouterContext<"/all-cities">) => {
	const db = await DB.instance;

	const cities = await db.queryStream(`SELECT * FROM addresses;`);

	ctx.response.status = cities.status;
	ctx.response.body = cities.body;
};
