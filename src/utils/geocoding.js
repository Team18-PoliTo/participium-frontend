// Cache for storing fetched addresses
const addressCache = new Map();

// Queue for managing sequential requests
let requestQueue = Promise.resolve();

/**
 * Delays execution for a specified time
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches address from coordinates using Nominatim reverse geocoding with rate limiting and caching
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} - Formatted address string
 */
export const getAddressFromCoordinates = async (lat, lng) => {
  // Create a cache key from rounded coordinates (to reduce cache misses for nearby points)
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;

  // Check cache first
  if (addressCache.has(cacheKey)) {
    return addressCache.get(cacheKey);
  }

  // Add request to queue to ensure sequential execution
  const result = await (requestQueue = requestQueue.then(async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            "User-Agent": "Participium-App", // Nominatim requires a User-Agent
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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

      const addressString =
        addressParts.length > 0 ? addressParts.join(", ") : "Address not found";

      // Store in cache
      addressCache.set(cacheKey, addressString);

      return addressString;
    } catch (error) {
      console.error("Error fetching address:", error);
      const fallback = "Address not available";
      addressCache.set(cacheKey, fallback);
      return fallback;
    }
  }));

  return result;
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

  return addressParts.length > 0
    ? addressParts.join(", ")
    : "Address not found";
};
