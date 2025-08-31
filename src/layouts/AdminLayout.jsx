// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './StaffLayout.css'; // Tái sử dụng CSS từ Staff Layout

const getPageTitle = (pathname) => {
    switch (pathname) {
        case '/admin/dashboard': return 'Tổng quan Hệ thống';
        case '/admin/staff': return 'Quản lý Nhân viên';
        default: return 'Trang Quản trị';
    }
};

export default function AdminLayout({ user, onLogout }) {
    const location = useLocation();
    const pageTitle = getPageTitle(location.pathname);

    return (
        <div className="staff-layout">
            <Sidebar userRole={user?.role} onLogout={onLogout} />
            <div className="main-content">
                <header className="staff-header">
                     <h1 className="page-title">{pageTitle}</h1>
                     <div className="user-info">
                         <span className="user-greeting">Xin chào, Admin {user?.username}!</span>
                         <img src={"/images/image.png"} alt="Admin Avatar" className="user-avatar" />
                     </div>
                </header>
                <main className="page-content">
                    <Outlet context={{ user }} />
                </main>
            </div>
        </div>
    );
}