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

const API = { registerCitizen };

export default API;