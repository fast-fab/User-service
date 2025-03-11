const axios = require("axios")
const dotenv = require('dotenv')
dotenv.config()

async function getCordinates(address,pincode) {
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
            params: {
                address: `${address}, ${pincode}`,
                key: process.env.MAPS_API
            }
        }
    );

    const results = response.data.results;

    if (!results.length) {
        return res.status(404).json({ error: "Address not found" });
    }

    const { lat, lng } = results[0].geometry.location;

    console.log("Latitude:", lat);
    console.log("Longitude:", lng)
    console.log("all good here ")
    return {lat,lng}
}

module.exports=getCordinates