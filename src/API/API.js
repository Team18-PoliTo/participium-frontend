const SERVER_URL = ''; //empty string to use proxy configured in vite.config.js

const registerCitizen = async (credentials) => {
    try {
        const response = await fetch(`${SERVER_URL}api/citizens/register`, {
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
        const response = await fetch(`${SERVER_URL}api/auth/citizens/login`, {
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
            const token = { accessToken: responseData.access_token, tokenType: responseData.token_type };
            localStorage.setItem('authToken', JSON.stringify(token.accessToken));
            return token;
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

const loginInternalUser = async (credentials) => {
    try {
        const response = await fetch(`${SERVER_URL}api/auth/internal/login`, {
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
            const token = { accessToken: responseData.access_token, tokenType: responseData.token_type };
            localStorage.setItem('authToken', JSON.stringify(token.accessToken));
            return token;
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

const getUserInfo = async () => {
    try {
        const token = JSON.parse(localStorage.getItem('authToken'));
        
        const response = await fetch(`${SERVER_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        if (response.ok) {
            const user = await response.json();
            return user;
        }
        else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch user info');
        }
    } catch (error) {
        throw error;
    }
}

const logoutUser = async () => {
    try {
        const token = JSON.parse(localStorage.getItem('authToken'));
        
        const response = await fetch(`${SERVER_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        if (response.ok) {
            localStorage.removeItem('authToken');
            return true;
        }
        else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Logout failed');
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

const API = { registerCitizen, loginCitizen, getAllInternalUsers, registerInternalUser, getUserInfo, logoutUser, loginInternalUser };

export default API;