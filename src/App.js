// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Import Layout và các trang chính ---
import StaffLayout from './layouts/StaffLayout';
import CompanyLayout from './layouts/CompanyLayout';
import Dashboard from './page-staff/Dashboard';
import AccountManagementPage from './page-staff/account-management';
import AccountDetailPage from './page-staff/AccountDetailPage';
import LocationManagementPage from './page-staff/location-management';
import AddLocationPageStaff from './page-staff/AddLocationPageStaff';
import LocationDetailPage from './page-staff/LocationDetailPage';
import ReviewManagementPage from './page-staff/review-management';
import AdManagementPage from './page-staff/ad-management';
import ContactManagementPage from './page-staff/ContactManagement';
import IntroducePage from './page-company/IntroducePage';
import AddLocationPage from './page-company/AddLocationPage';
import AddAdPage from './page-company/AddAdPage';
import CompanyLocationDetailPage from './page-company/CompanyLocationDetailPage';
import PaymentResultPage from './page-company/PaymentResultPage';
import CompanyDashboard from './page-company/CompanyDashboard';
import CompanyLocationManagement from './page-company/CompanyLocationManagement';
import CompanyAdManagement from './page-company/CompanyAdManagement';

// --- Import các trang xác thực, Onboarding, và trang User ---
import AuthPage from './page-auth/AuthPage';
import UnauthorizedPage from './page-auth/UnauthorizedPage';
import Onboarding from './components/Onboarding';
import UserDashboard from './page-user/UserDashboard';
// --- THAY ĐỔI: Import các component mới của trang User ---
import Profile from './page-user/UseComponent/Profile';
import LocationDetailPageUser from './page-user/UseComponent/LocationDetailPageUser';
import SupportPage from './page-user/UseComponent/SupportPage';


// --- Import các trang của Admin (MỚI) ---
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './page-admin/AdminDashboard';
import StaffManagementPage from './page-admin/StaffManagement';


// --- Import API services ---
import { login, getCurrentUser } from './services/api';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [userProfile, setUserProfile] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("user");
    setUser(null);
    setUserProfile(null);
    setNeedsOnboarding(false);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && user.role === 'USER') {
        try {
          const response = await getCurrentUser();
          const profile = response.data || response;
          setUserProfile(profile);
          if (!profile.travelStyles || profile.travelStyles.length === 0) {
            setNeedsOnboarding(true);
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin người dùng, đang đăng xuất:", error);
          handleLogout();
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setIsLoadingProfile(false);
      }
    };
    fetchUserProfile();
  }, [user, handleLogout]);

  const handleOnboardingComplete = useCallback(() => {
    setNeedsOnboarding(false);
    const fetchUserProfile = async () => {
      try {
        const response = await getCurrentUser();
        setUserProfile(response.data || response);
      } catch (error) {
        console.error("Lỗi khi tải lại profile sau onboarding:", error);
      }
    };
    fetchUserProfile();
  }, []);

  const handleLogin = async ({ username, password }) => {
    try {
      const response = await login(username, password);
      
      const newUser = {
        token: response.token,
        role: response.role,
        userId: response.userId,
        username: response.username,
      };

      if (!newUser.role || newUser.userId === undefined) {
        alert("Lỗi: Phản hồi đăng nhập không chứa đủ thông tin (role/userId). Vui lòng kiểm tra lại backend.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      setIsLoadingProfile(true);

    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert("Đăng nhập thất bại: " + error.message);
      throw error;
    }
  };

  if (isLoadingProfile) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Đang tải dữ liệu...</div>;
  }

  if (user && user.role === 'USER' && needsOnboarding && userProfile) {
    return <Onboarding user={userProfile} onComplete={handleOnboardingComplete} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/introduce" element={<IntroducePage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/login" element={!user ? <AuthPage onLogin={handleLogin} /> : <Navigate to="/" />} />

        <Route path="/" element={
            !user ? <Navigate to="/login" /> :
            user.role === 'ADMIN' ? <Navigate to="/admin/dashboard" /> :
            user.role === 'STAFF' ? <Navigate to="/staff/dashboard" /> :
            user.role === 'COMPANY' ? <Navigate to="/company/dashboard" /> :
            user.role === 'USER' ? <Navigate to="/user/dashboard" /> :
            <Navigate to="/unauthorized" />
        } />

        {/* --- Admin Routes (MỚI) --- */}
        <Route path="/admin/*" element={
            user && user.role === 'ADMIN'
            ? <AdminLayout user={user} onLogout={handleLogout} />
            : <Navigate to={user ? "/unauthorized" : "/login"} />
        }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="staff" element={<StaffManagementPage />} />
        </Route>

        {/* --- Staff Routes --- */}
        <Route path="/staff/*" element={
            user && user.role === 'STAFF'
            ? <StaffLayout user={user} onLogout={handleLogout} />
            : <Navigate to={user ? "/unauthorized" : "/login"} />
        }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="accounts" element={<AccountManagementPage />} />
            <Route path="accounts/:accountId" element={<AccountDetailPage />} />
            <Route path="locations" element={<LocationManagementPage />} />
            <Route path="add-location" element={<AddLocationPageStaff />} />
            <Route path="locations/:locationId" element={<LocationDetailPage />} />
            <Route path="reviews" element={<ReviewManagementPage />} />
            <Route path="ads" element={<AdManagementPage />} />
            <Route path="contacts" element={<ContactManagementPage />} />
        </Route>

        {/* --- Company Routes --- */}
        <Route path="/company/*" element={
            user && user.role === 'COMPANY'
            ? <CompanyLayout user={user} onLogout={handleLogout} />
            : <Navigate to={user ? "/unauthorized" : "/login"} />
        }>
            <Route path="dashboard" element={<CompanyDashboard />} />
            <Route path="locations" element={<CompanyLocationManagement />} />
            <Route path="locations/:locationId" element={<CompanyLocationDetailPage />} />
            <Route path="ads" element={<CompanyAdManagement />} />
            <Route path="add-location" element={<AddLocationPage />} />
            <Route path="add-ad" element={<AddAdPage />} />
        </Route>
        
        <Route path="/payment-return" element={<PaymentResultPage />} />

        {/* --- User Routes (ĐÃ CẬP NHẬT) --- */}
        <Route path="/user/dashboard" element={user && user.role === 'USER' ? <UserDashboard onLogout={handleLogout} /> : <Navigate to={user ? "/unauthorized" : "/login"} />} />
        <Route path="/profile" element={user && user.role === 'USER' ? <Profile/> : <Navigate to={user ? "/unauthorized" : "/login"} />} />
        <Route path="/location/:locationId/:locationSlug" element={<LocationDetailPageUser />} />
        <Route path="/support" element={user && user.role === 'USER' ? <SupportPage /> : <Navigate to={user ? "/unauthorized" : "/login"} />} />


        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;