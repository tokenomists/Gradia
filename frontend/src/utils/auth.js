import instance from './axios.js';

export const isAuthenticated = async () => {
    try {
        const response = await instance.get('/api/auth/check', { withCredentials: true });
        return response.data.isAuthenticated;
    } catch (error) {
        console.log('Auth Check failed:', error);
        return false;
    }
};

export const logout = async () => {
    try {
        await instance.post("/api/auth/logout");
    } catch (error) {
        console.error("Logout error:", error);
    }
};