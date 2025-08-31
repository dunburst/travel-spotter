// src/layouts/CompanyLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './CompanyLayout.css';

const getPageTitle = (pathname) => {
    if (pathname.startsWith('/company/add-location')) return 'Thêm địa điểm mới';
    if (pathname.startsWith('/company/add-ad')) return 'Tạo chiến dịch mới';
    switch (pathname) {
        case '/company/dashboard': return 'Tổng quan';
        case '/company/locations': return 'Quản lý Địa điểm';
        case '/company/ads': return 'Quản lý Quảng cáo';
        default: return 'Trang doanh nghiệp';
    }
};

export default function CompanyLayout({ user, onLogout }) {
    const location = useLocation();
    const pageTitle = getPageTitle(location.pathname);

    return (
        <div className="company-layout">
            <Sidebar
                userRole={user?.role}
                onLogout={onLogout}
            />
            <div className="main-content">
                <header className="company-header">
                     <h1 className="page-title">{pageTitle}</h1>
                     <div className="user-info">
                         <span className="user-greeting">Xin chào, {user?.username}!</span>
                         <img src={'https://placehold.co/40x40/3b82f6/ffffff?text=CT'} alt="User Avatar" className="user-avatar" />
                     </div>
                </header>

                <main className="page-content">
                    <Outlet context={{ user }} />
                </main>
            </div>
        </div>
    );
}