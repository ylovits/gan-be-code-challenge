const express = require('express');
const router = express.Router();
const { getCitiesByTag, getDistance, getArea, getAllCities, getAreaResult } = require("./addresses.js");

router.get("/cities-by-tag", getCitiesByTag)
	.get("/distance", getDistance)
	.get("/area", getArea)
	.get("/area-result/:id", getAreaResult)
	.get("/all-cities", getAllCities);

module.exports = router;