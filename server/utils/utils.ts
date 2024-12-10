import DB from "../db/db.ts";

// Using the Spherical Law of Cosines to calculate the distance between two points on the Earth
// Thank you henryrossiter for this: https://gist.github.com/henryrossiter/0e8c9786706f6971eb1580600ea9a169
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
	const R = 6371; // kilometers
	const p1 = lat1 * Math.PI / 180;
	const p2 = lat2 * Math.PI / 180;
	const deltaP = p2 - p1;
	const deltaLon = lon2 - lon1;
	const deltaLambda = (deltaLon * Math.PI) / 180;
	const a = Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
		Math.cos(p1) * Math.cos(p2) *
		Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
	const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
	return Number(d.toFixed(2));
}

// Using the earth_box and ll_to_earth functions to find addresses in a certain area
// Reference: https://www.youtube.com/watch?v=g2pbk5wz1PM&ab_channel=PGCastsbyHashrocket
const findAddressesInArea = async (address_id: string, distance: number) => {

	const db = await DB.instance;

	await new Promise(resolve => setTimeout(resolve, 200)); // Fake delay just in case it takes less than 100ms

	const citiesInArea = await db.query(`
		SELECT addr.guid, earth_distance(
			ll_to_earth(center_point.latitude, center_point.longitude),
			ll_to_earth(addr.latitude, addr.longitude)
		) as distance,
		addr.address
		FROM addresses addr,
		LATERAL(SELECT guid, latitude, longitude FROM addresses WHERE guid = $1) AS center_point
		WHERE addr.guid <> center_point.guid
		AND earth_distance(
			ll_to_earth(center_point.latitude, center_point.longitude),
			ll_to_earth(addr.latitude, addr.longitude)
		) <= $2
		AND earth_box(ll_to_earth(center_point.latitude, center_point.longitude), $2) @> ll_to_earth(addr.latitude, addr.longitude)
	`, [address_id, `${distance * 1000}`]);

	// Update the area_calculations table with the results
	if (citiesInArea.length > 0) {
		db.query(`UPDATE area_calculations SET status = 'COMPLETED', result = $1 WHERE address_id = $2;`, [JSON.stringify(citiesInArea), address_id]);
	}

}

export type ParsedPostgresNumbers<T> = {
	[K in keyof T]: T[K] extends string ? number : T[K];
};

// Parse numeric fields from a row. Postgres returns all fields as strings.
const parseNumericFields = <T>(row: T): ParsedPostgresNumbers<T> => {
	const result = {} as ParsedPostgresNumbers<T>;
	for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
		if (typeof value === 'string' && !isNaN(Number(value))) {
			(result as Record<string, unknown>)[key] = Number(value);
		} else {
			(result as Record<string, unknown>)[key] = value;
		}
	}
	return result;
}

export { calculateDistance, findAddressesInArea, parseNumericFields };