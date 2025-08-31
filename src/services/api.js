// src/services/api.js
import axios from 'axios';

// --- CẤU HÌNH CHUNG ---
const API_BASE_URL = 'http://26.118.131.110:8080';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: { 'Content-Type': 'application/json' }
});

// Thêm interceptor để tự động gắn token vào mỗi request
api.interceptors.request.use(config => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
        config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});


// --- API XÁC THỰC ---
export const login = async (username, password) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại");
  return data;
};

export const registerUser = (userData) => {
  return axios.post(`${API_BASE_URL}/api/accounts/register/user`, userData);
};

export const registerCompany = (companyData) => {
  return axios.post(`${API_BASE_URL}/api/accounts/register/company`, companyData);
};


// --- API LIÊN QUAN ĐẾN USER PROFILE ---
export const updateUserProfile = (userId, profileData) => {
    return api.put(`/accounts/user/${userId}`, profileData);
};

export const getCurrentUser = async () => {
    const response = await api.get('/accounts/me/user');
    return response.data;
};


// --- CÁC HÀM API KHÁC ---
export const createContactInfo = (contactData) => api.post('/contact-info', contactData);
export const getAllContactInfo = () => api.get('/contact-info');
export const getAllAccounts = () => api.get('/accounts');
export const getPendingCompanyAccounts = () => api.get('/accounts/pending');
export const approveCompanyAccount = (accountId) => api.put(`/accounts/${accountId}/approve`);
export const rejectCompanyAccount = (accountId) => api.put(`/accounts/${accountId}/reject`);
export const updateAccountStatus = (accountId, status) => api.put(`/accounts/${accountId}/status`, null, { params: { status } });
export const getPendingAccountDetail = (accountId) => api.get(`/accounts/pending/${accountId}`);
export const getAllLocations = () => api.get('/locations');
export const getCompanyLocations = () => api.get('/locations/me/company');
export const getPendingLocations = () => api.get('/locations/pending');
export const approveLocation = (locationId) => api.put(`/locations/${locationId}/approve`);
export const rejectLocation = (locationId) => api.put(`/locations/${locationId}/reject`);
export const deleteLocation = (locationId) => api.delete(`/locations/${locationId}`);
export const getPendingLocationDetail = (locationId) => api.get(`/locations/pending/${locationId}`);
export const getLocationDetail = (locationId) => api.get(`/locations/${locationId}`);
export const getAllReviews = () => api.get('/reviews');
export const getPendingReviews = () => api.get('/reviews/pending');
export const approveReview = (reviewId) => api.put(`/reviews/${reviewId}/approve`);
export const rejectReview = (reviewId) => api.put(`/reviews/${reviewId}/reject`);
export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);
export const getAllAds = () => api.get('/ads');
export const getCompanyAds = () => api.get('/ads/me');
export const getPendingAds = () => api.get('/ads/pending');
export const approveAd = (adId) => api.put(`/ads/${adId}/approve`);
export const rejectAd = (adId) => api.put(`/ads/${adId}/reject`);
export const deleteAd = (adId) => api.delete(`/ads/${adId}`);
export const createAd = (adData) => api.post('/ads', adData);
export const getCompanyRegisteredNotifications = () => api.get('/notifications/company-registered');
export const getUserRegisteredNotifications = () => api.get('/notifications/user-registered');
export const getAdsCreatedNotifications = () => api.get('/notifications/ads-created');
export const getLocationsCreatedNotifications = () => api.get('/notifications/locations-created');
export const getReviewsCreatedNotifications = () => api.get('/notifications/reviews-created');
export const getAllCategories = () => api.get('/categories');
export const createPayment = (amount, adId) => api.get(`/payment/create-payment`, { params: { amount, adId } });
export const getRecommendations = (data) => axios.post('http://26.118.131.110:3001/api/get-recommendations', data);

export const createLocationWithImages = (locationData, images) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(locationData));
    images.forEach((image) => {
        formData.append('image', image);
    });
    return api.post('/locations', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const createLocationByStaff = (locationData, images) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(locationData)); 
    images.forEach((image) => {
        formData.append('image', image);
    });
    return api.post('/locations/staff', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// --- API CHO QUẢN LÝ NHÂN VIÊN BỞI ADMIN ---
export const getAllStaffAccounts = () => api.get('/accounts/staff');
export const createAccount = (accountData) => api.post('/accounts', accountData);
export const updateAccount = (accountId, accountData) => api.put(`/accounts/${accountId}`, accountData);
export const deleteAccount = (accountId) => api.delete(`/accounts/${accountId}`);