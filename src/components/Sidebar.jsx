// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaUsersCog,
    FaMapMarkerAlt,
    FaStarHalfAlt,
    FaAd,
    FaSignOutAlt,
    FaMapMarkedAlt,
    FaAddressBook
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ counts = {}, hasNewContacts, onViewContacts, onLogout }) => {

    const handleLogoutClick = (e) => {
        e.preventDefault(); // Ngăn link thêm dấu '#' vào URL
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            onLogout();
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <FaMapMarkedAlt className="logo-icon" />
                <span className="logo-text">TravelSuggest</span>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/staff/dashboard" className="sidebar-link">
                    <FaTachometerAlt className="sidebar-icon" />
                    <span>Tổng quan</span>
                </NavLink>
                <NavLink to="/staff/accounts" className="sidebar-link">
                    <FaUsersCog className="sidebar-icon" />
                    <span>Quản lý Tài khoản</span>
                    {counts.accounts > 0 && <span className="badge">{counts.accounts}</span>}
                </NavLink>
                <NavLink to="/staff/locations" className="sidebar-link">
                    <FaMapMarkerAlt className="sidebar-icon" />
                    <span>Kiểm duyệt Địa điểm</span>
                    {counts.locations > 0 && <span className="badge">{counts.locations}</span>}
                </NavLink>
                <NavLink to="/staff/reviews" className="sidebar-link">
                    <FaStarHalfAlt className="sidebar-icon" />
                    <span>Kiểm duyệt Đánh giá</span>
                    {counts.reviews > 0 && <span className="badge">{counts.reviews}</span>}
                </NavLink>
                <NavLink to="/staff/ads" className="sidebar-link">
                    <FaAd className="sidebar-icon" />
                    <span>Kiểm duyệt Quảng cáo</span>
                    {counts.ads > 0 && <span className="badge">{counts.ads}</span>}
                </NavLink>

                <NavLink to="/staff/contacts" className="sidebar-link" onClick={onViewContacts}>
                    <FaAddressBook className="sidebar-icon" />
                    <span>Hòm thư liên hệ</span>
                    {hasNewContacts && (
                        <span className="notification-indicator-wrapper">
                            <span className="notification-ping"></span>
                            <span className="notification-dot"></span>
                        </span>
                    )}
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <a href="#" onClick={handleLogoutClick} className="sidebar-link">
                    <FaSignOutAlt className="sidebar-icon" />
                    <span>Đăng xuất</span>
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;