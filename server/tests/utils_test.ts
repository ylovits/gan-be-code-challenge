import { parseNumericFields, calculateDistance } from "../utils/utils.ts";
import { assert } from "asserts";

Deno.test("parseNumericFields should convert postgres' numeric strings to numbers", () => {
	const input = {
		"guid": "db52fa77-9a6f-45f0-add0-cbafd5eaf63a",
		"isActive": false,
		"address": "941 Merit Court, Golconda, Minnesota, 9539",
		"latitude": "82.231721",
		"longitude": "-108.885769",
		"tags": [
			"consectetur",
			"commodo",
			"dolor",
			"enim",
			"deserunt",
			"sunt",
			"sunt"
		]
	};

	const expectedOutput = {
		"guid": "db52fa77-9a6f-45f0-add0-cbafd5eaf63a",
		"isActive": false,
		"address": "941 Merit Court, Golconda, Minnesota, 9539",
		"latitude": 82.231721,
		"longitude": -108.885769,
		"tags": [
			"consectetur",
			"commodo",
			"dolor",
			"enim",
			"deserunt",
			"sunt",
			"sunt"
		]
	};

	const result = parseNumericFields(input);

	assert(JSON.stringify(result) == JSON.stringify(expectedOutput));

});

Deno.test("calculateDistance should calculate the correct distance between two points", () => {
	// Patras
	const lat1 = 38.2466;
	const lon1 = 21.7346;

	// Copenhagen
	const lat2 = 55.6761;
	const lon2 = 12.5683;

	const distance = calculateDistance(lat1, lon1, lat2, lon2);
	const expectedDistance = 2054.94; // Expected distance in kilometers for a perfect sphere earth
	assert(distance === expectedDistance);
});