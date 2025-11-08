const SERVER_URL = ''; //empty string to use proxy configured in vite.config.js

const registerCitizen = async (credentials) => {
    try {
        const response = await fetch(`${SERVER_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: {
                firstName: credentials.name,
                lastName: credentials.surname,
                username: credentials.username,
                email: credentials.email,
                password: credentials.password
            }
        });
        if (response.ok) {
        }
        else {

        }
    } catch (error) {
    }
}

const loginCitizen = async (credentials) => {
    try {
        const response = await fetch(`${SERVER_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: {
                email: credentials.email,
                password: credentials.password
            }
        });
        if (response.ok) {
        }
        else {
        }
    } catch (error) {
    }
}

const getAllInternalUsers = async () => {
    try {
        const response = await fetch(`${SERVER_URL}/api/internalUsers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            return data;
        }
        else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch internal users'); 
        }
    } catch (error) {
    }
}

const API = { registerCitizen, loginCitizen, getAllInternalUsers };

export default API;