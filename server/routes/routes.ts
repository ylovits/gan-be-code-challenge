import { Router } from "oak";
import { getCitiesByTag, getDistance, getArea, getAllCities, getAreaResult } from "./addresses.ts";

const router = new Router()
	.get("/cities-by-tag", getCitiesByTag)
	.get("/distance", getDistance)
	.get("/area", getArea)
	.get("/area-result/:id", getAreaResult)
	.get("/all-cities", getAllCities);

export default router;