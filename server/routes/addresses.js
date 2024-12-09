const path = require('path');
const fs = require('fs-extra');
const { calculateDistance, findAddressesInArea } = require('../utils/utils.js');
const addresses = require('../db/addresses.json');
const calculationsJsonPath = path.resolve(__dirname, '../db/calculations.json');

const getCitiesByTag = async (req, res) => {
	const { tag, isActive } = req.query;

	if (tag === "excepteurus" && isActive === "true") {
		const cities = addresses.filter(address =>
			address.tags.includes(tag) && address.isActive.toString() === isActive
		);

		if (cities.length > 0) {
			res.status(200).send({ cities });
			return;
		}
	}

	res.status(404).send({ message: "No city found" });
};

const getDistance = async (req, res) => {
	const { from, to } = req.query;

	if (from && to) {
		const toAddress = addresses.find(city => city.guid === to);
		const fromAddress = addresses.find(city => city.guid === from);

		if (fromAddress && toAddress) {
			const distance = calculateDistance(
				fromAddress.latitude,
				fromAddress.longitude,
				toAddress.latitude,
				toAddress.longitude
			);
			res.status(200).send({ from: fromAddress, to: toAddress, unit: "km", distance });
			return;
		}
	}

	res.status(404).send({ message: "One or more addresses not found" });
};

const getArea = async (req, res) => {

	const { from, distance } = req.query;

	if (from && distance) {
		const areaCalculationId = "2152f96f-50c7-4d76-9e18-f7033bd14428" // fake uuid

		// Get "cached" calculations
		let areaCalculations = {};
		try {
			areaCalculations = JSON.parse(fs.readFileSync(calculationsJsonPath));

			if (areaCalculations[areaCalculationId] && areaCalculations[areaCalculationId].status === "COMPLETED") {
				res.status(200).send({ cities: areaCalculations[areaCalculationId].cities });
				delete areaCalculations[areaCalculationId];
				fs.writeFileSync(calculationsJsonPath, JSON.stringify(areaCalculations, null, 2), 'utf-8');
				return;
			} else if (areaCalculations[areaCalculationId] && areaCalculations[areaCalculationId].status === "PENDING") {
				res.status(202).send({ message: "Area calculation is still pending" });
				return;
			}

		} catch (error) {
			console.error("Error reading calculations.json", error);
		}

		// Write non cached calculations
		const areaCalculation = { from, distance, status: "PENDING" };
		areaCalculations[areaCalculationId] = areaCalculation;
		fs.writeFileSync(calculationsJsonPath, JSON.stringify(areaCalculations, null, 2), 'utf-8');

		res.status(202).send({
			resultsUrl: `${process.env.SERVER_PROTOCOL}://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/area-result/${areaCalculationId}`,
		});

		const { latitude, longitude } = addresses.find(city => city.guid === from);
		const restOfAddresses = addresses.filter(city => city.guid !== from);
		const result = await findAddressesInArea(restOfAddresses, latitude, longitude, Number(distance));
		areaCalculations[areaCalculationId] = { cities: result, status: "COMPLETED" };
		fs.writeFileSync(calculationsJsonPath, JSON.stringify(areaCalculations, null, 2), 'utf-8');
		return;
	}

	res.status(404).send({ message: "One or more addresses not found" });

};


const getAreaResult = async (req, res) => {
	const id = req.params.id;

	const areaCalculation = JSON.parse(fs.readFileSync(calculationsJsonPath))[id];

	if (areaCalculation) {
		if (areaCalculation.status === "COMPLETED") {

			res.status(200);
			res.json({ cities: areaCalculation.cities });
			return;
		}
		res.status(202).send({ message: "Area calculation is still pending" })
		return;
	}

	res.status(404).send({ message: "Area calculation not found" });
};

const getAllCities = async (_req, res) => {
	const readStream = fs.createReadStream(path.resolve(__dirname, '../db/addresses.json'));
	for await (const chunk  of readStream) {
		res.write(chunk )
	}
	res.end();
};


module.exports = {
	getCitiesByTag,
	getDistance,
	getArea,
	getAreaResult,
	getAllCities
}