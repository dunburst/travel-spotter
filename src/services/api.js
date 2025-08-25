// src/services/api.js

import axios from 'axios';

// --- CẤU HÌNH CHUNG ---
// Thay đổi IP và port nếu backend của bạn chạy ở địa chỉ khác
const API_BASE_URL = 'http://26.118.131.110:8080/api';

// Tạo một instance của axios để có thể dễ dàng thêm token sau này
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// --- API CHO CONTACT INFO ---
/**
 * Gửi thông tin liên hệ mới lên server.
 * @param {object} contactData - Dữ liệu form liên hệ.
 * @param {string} contactData.fullName - Tên đầy đủ.
 * @param {string} contactData.email - Email.
 * @param {string} contactData.phoneNumber - Số điện thoại.
 * @param {string} contactData.note - Lời nhắn.
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const createContactInfo = (contactData) => api.post('/contact-info', contactData);

export const getAllContactInfo = () => api.get('/contact-info');



// --- API CHO ACCOUNTS ---
export const getAllAccounts = () => api.get('/accounts');
export const getPendingCompanyAccounts = () => api.get('/accounts/pending');
export const approveCompanyAccount = (accountId) => api.put(`/accounts/${accountId}/approve`);
export const rejectCompanyAccount = (accountId) => api.put(`/accounts/${accountId}/reject`);
export const updateAccountStatus = (accountId, status) => api.put(`/accounts/${accountId}/status`, null, { params: { status } });
export const getPendingAccountDetail = (accountId) => api.get(`/accounts/pending/${accountId}`);


// --- API CHO LOCATIONS ---
export const getAllLocations = () => api.get('/locations');
export const getPendingLocations = () => api.get('/locations/pending');
export const approveLocation = (locationId) => api.put(`/locations/${locationId}/approve`);
export const rejectLocation = (locationId) => api.put(`/locations/${locationId}/reject`);
export const deleteLocation = (locationId) => api.delete(`/locations/${locationId}`);
export const createLocation = (locationData) => api.post('/locations', locationData);
export const getPendingLocationDetail = (locationId) => api.get(`/locations/pending/${locationId}`);

// --- API CHO REVIEWS ---
export const getAllReviews = () => api.get('/reviews');
export const getPendingReviews = () => api.get('/reviews/pending');
export const approveReview = (reviewId) => api.put(`/reviews/${reviewId}/approve`);
export const rejectReview = (reviewId) => api.put(`/reviews/${reviewId}/reject`);
export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);

// --- API CHO ADVERTISEMENTS (ADS) ---
export const getAllAds = () => api.get('/ads');
export const getPendingAds = () => api.get('/ads/pending');
export const approveAd = (adId) => api.put(`/ads/${adId}/approve`);
export const rejectAd = (adId) => api.put(`/ads/${adId}/reject`);
export const deleteAd = (adId) => api.delete(`/ads/${adId}`);

// --- API CHO NOTIFICATIONS ---
export const getCompanyRegisteredNotifications = () => api.get('/notifications/company-registered');
export const getUserRegisteredNotifications = () => api.get('/notifications/user-registered');
export const getAdsCreatedNotifications = () => api.get('/notifications/ads-created');
export const getLocationsCreatedNotifications = () => api.get('/notifications/locations-created');
export const getReviewsCreatedNotifications = () => api.get('/notifications/reviews-created');