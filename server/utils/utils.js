// Using the Spherical Law of Cosines to calculate the distance between two points on the Earth
// Thank you henryrossiter for this: https://gist.github.com/henryrossiter/0e8c9786706f6971eb1580600ea9a169
const calculateDistance = (lat1, lon1, lat2, lon2) => {
	const R = 6371e3;
	const p1 = lat1 * Math.PI/180;
	const p2 = lat2 * Math.PI/180;
	const deltaP = p2 - p1;
	const deltaLon = lon2 - lon1;
	const deltaLambda = (deltaLon * Math.PI) / 180;
	const a = Math.sin(deltaP/2) * Math.sin(deltaP/2) +
			  Math.cos(p1) * Math.cos(p2) *
			  Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
	const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * R;
	return Number((d / 1000).toFixed(2));
}

const findAddressesInArea = async (addresses, latitude, longitude, radius) => {
	await new Promise(resolve => setTimeout(resolve, 200)); // Fake delay just in case it takes less than 100ms
	const addressesInArea = [];
	for (const address of addresses) {
		const distance = calculateDistance(latitude, longitude, address.latitude, address.longitude);

		if ( distance <= radius	) {
			addressesInArea.push(address);
		}
	}
	return addressesInArea;
}

module.exports = {
	calculateDistance,
	findAddressesInArea
}