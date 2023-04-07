const express = require("express");
const {
    getAllLocations,
    createLocation,
    getLocationById,
    updateLocation,
    deleteLocation,
} = require("../controllers/LocationController.js");

const router = express.Router();

router.route("/").get(getAllLocations).post(createLocation);
router.route("/:id").get(getLocationById).put(updateLocation).delete(deleteLocation);

module.exports = router;