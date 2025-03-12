const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();

async function getCordinates(address, pincode) {
  if (!address || address.trim() === '') {
    return { lat: null, lng: null, error: "Address is required" };
  }

  const pincodeinstring = String(pincode);
  if (!pincode || pincodeinstring.length !== 6 || !/^\d+$/.test(pincodeinstring)) {
    return { lat: null, lng: null, error: "Invalid pincode. Indian pincodes must be 6 digits" };
  }

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
  if (!results || !results.length) {
    return { lat: null, lng: null, error: "Address not found" };
  }

  const { lat, lng } = results[0].geometry.location;
  console.log("Latitude:", lat);
  console.log("Longitude:", lng);
  console.log("all good here");
  return { lat,lng};
}

module.exports = getCordinates;