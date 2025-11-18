/**
 * Fetches address from coordinates using Nominatim reverse geocoding
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} - Formatted address string
 */
export const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    );
    const data = await response.json();

    // Extract only street, house number, and postcode
    const addressParts = [];
    if (data.address) {
      const road = data.address.road || data.address.street;
      const houseNumber = data.address.house_number;
      const postcode = data.address.postcode;

      if (road) {
        addressParts.push(road);
      }
      if (houseNumber) {
        addressParts.push(houseNumber);
      }
      if (postcode) {
        addressParts.push(postcode);
      }
    }

    return addressParts.length > 0
      ? addressParts.join(", ")
      : "Address not found";
  } catch (error) {
    console.error("Error fetching address:", error);
    throw new Error("Unable to retrieve address");
  }
};

/**
 * Formats address parts into a single string
 * @param {Object} addressData - Address data from Nominatim
 * @returns {string} - Formatted address
 */
export const formatAddress = (addressData) => {
  const addressParts = [];
  
  if (addressData) {
    const road = addressData.road || addressData.street;
    const houseNumber = addressData.house_number;
    const postcode = addressData.postcode;

    if (road) addressParts.push(road);
    if (houseNumber) addressParts.push(houseNumber);
    if (postcode) addressParts.push(postcode);
  }

  return addressParts.length > 0 ? addressParts.join(", ") : "Address not found";
};