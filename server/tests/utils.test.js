const assert = require('assert');
const { calculateDistance, findAddressesInArea } = require('../utils/utils');
const addresses = require('./mock.json');

const pass = (str) => console.log('\x1b[32m%s\x1b[0m', "✔  - " + str + "\n");
const fail = (str, error) => {
	console.error('\x1b[31m%s\x1b[0m', "✘  - " +str + "\n");
	console.error(error);
}
const startTest = (str) => {
	console.count("\nTest: ");
	console.log("\x1b[36m%s\x1b[0m", "*** " + str);
}

(async () => {

	try {
		startTest("calculateDistance should calculate the correct distance between two points");

		// Patras
		const lat1 = 38.2466;
		const lon1 = 21.7346;

		// Copenhagen
		const lat2 = 55.6761;
		const lon2 = 12.5683;

		const distance = calculateDistance(lat1, lon1, lat2, lon2);
		const expectedDistance = 2054.94; // Expected distance in kilometers for a perfect sphere earth

		assert.strictEqual(distance, expectedDistance);

		pass('calculateDistance test passed');
	} catch (error) {
		fail('calculateDistance test failed:', error);
	}

	try {
		startTest("findAddressesInArea should find addresses within the specified radius")

		const latitude = 82.231721;
		const longitude = -108.885769;
		const radius = 6000;

		const result = await findAddressesInArea(addresses, latitude, longitude, radius);
		assert.strictEqual(result.length, 2);

		pass('findAddressesInArea test passed');

	} catch (error) {
		fail('findAddressesInArea test failed:', error);
	}

	try {
		startTest("findAddressesInArea should return an empty array if no addresses are within the specified radius")

		const latitude = 82.231721;
		const longitude = -108.885769;
		const radius = 10;

		const result = await findAddressesInArea(addresses, latitude, longitude, radius);
		assert.strictEqual(result.length, 1);


		pass('findAddressesInArea (empty result) test passed');
	} catch (error) {
		fail('findAddressesInArea (empty result) test failed:', error);
	}

})();