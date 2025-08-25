// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Layout chung
import StaffLayout from './layouts/StaffLayout';

// Import các trang
import Dashboard from './page-staff/Dashboard';
import AccountManagementPage from './page-staff/account-management';
import LocationManagementPage from './page-staff/location-management';
import ReviewManagementPage from './page-staff/review-management';
import AdManagementPage from './page-staff/ad-management';
import AccountDetailPage from './page-staff/AccountDetailPage';
import IntroducePage from './page-company/IntroducePage';
import LocationDetailPage from './page-staff/LocationDetailPage';
import ContactManagementPage from './page-staff/ContactManagement'; // **THÊM DÒNG NÀY**

function App() {
  return (
    <Router>
      <Routes>
        {/* Route mặc định */}
        <Route path="/" element={<Navigate to="/staff/dashboard" />} />

        {/* --- CÁC ROUTE NGANG HÀNG --- */}

        {/* Route cho trang giới thiệu (nằm riêng) */}
        <Route path="/introduce" element={<IntroducePage />} />

        {/* Route cho layout của nhân viên */}
        <Route path="/staff" element={<StaffLayout />}>
          {/* Các route con tương đối của /staff */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="accounts" element={<AccountManagementPage />} />
          <Route path="accounts/:accountId" element={<AccountDetailPage />} />
          <Route path="locations" element={<LocationManagementPage />} />
          <Route path="locations/:locationId" element={<LocationDetailPage />} /> 
          <Route path="reviews" element={<ReviewManagementPage />} />
          <Route path="ads" element={<AdManagementPage />} />
          <Route path="contacts" element={<ContactManagementPage />} /> {/* **THÊM DÒNG NÀY** */}
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;