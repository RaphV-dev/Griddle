import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getDashboard = () => api.get('/users/dashboard');
export const changePassword = (payload) => api.put('/users/password', payload);
export const getAdminDashboard = () => api.get('/admin/dashboard');
export const deleteUserAccount = (userId) => api.delete(`/admin/users/${userId}`);
export const deleteUserDailyTry = (userId) => api.delete(`/admin/users/${userId}/daily-try`);

export default api;