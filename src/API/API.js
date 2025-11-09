const SERVER_URL = ''; //empty string to use proxy configured in vite.config.js

const registerCitizen = async (credentials) => {
    try {
        const response = await fetch(`${SERVER_URL}api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                email: credentials.email,
                username: credentials.username,
                firstName: credentials.name,
                lastName: credentials.surname,
                password: credentials.password
            })
        });
        if (response.ok) {
            const citizen = await response.json().user;
            return citizen;
        }
        else if (response.status === 400) {
            throw new Error('Password must have at least 6 characters');
        }
        else if (response.status === 409) {
            throw new Error('Email or username already in use');
        }
        else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }
    } catch (error) {
        throw error;
    }
}

const loginCitizen = async (credentials) => {
    try {
        const response = await fetch(`${SERVER_URL}api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password
            })
        });
        if (response.ok) {
            const responseData = await response.json();
            const citizen = responseData.user;
            const token = responseData.token;
            localStorage.setItem('authToken', token);
            return { citizen, token };
        }
        else if (response.status === 400) {
            throw new Error('Email and password are required');
        }
        else if (response.status === 401) {
            throw new Error('Invalid email or password');
        }
        else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }
    } catch (error) {
        throw error;
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

const registerInternalUser = async (credentials) => {
    try {
        const response = await fetch(`${SERVER_URL}/api/registerInternalUser`, {
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

const API = { registerCitizen, loginCitizen, getAllInternalUsers, registerInternalUser };

export default API;