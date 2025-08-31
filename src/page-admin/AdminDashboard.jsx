// src/page-admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaBuilding, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import { getAllAccounts, getAllLocations, getAllReviews } from '../services/api';
import '../page-staff/Dashboard.css'; // Tái sử dụng CSS

const StatCard = ({ title, count, icon, color }) => (
    <div className="stat-card">
        <div>
            <p className="stat-title">{title}</p>
            <p className="stat-count">{count}</p>
        </div>
        <div className={`stat-icon-wrapper icon-${color}`}>{icon}</div>
    </div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        companies: 0,
        locations: 0,
        reviews: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const [accountsRes, locationsRes, reviewsRes] = await Promise.all([
                getAllAccounts(),
                getAllLocations(),
                getAllReviews(),
            ]);

            const users = accountsRes.data.filter(acc => acc.role === 'USER').length;
            const companies = accountsRes.data.filter(acc => acc.role === 'COMPANY').length;

            setStats({
                users: users,
                companies: companies,
                locations: locationsRes.data.length,
                reviews: reviewsRes.data.length,
            });
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu tổng quan:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const statCards = [
        { title: "Tổng số Người dùng", count: stats.users, icon: <FaUsers />, color: "blue" },
        { title: "Tổng số Đối tác", count: stats.companies, icon: <FaBuilding />, color: "green" },
        { title: "Tổng số Địa điểm", count: stats.locations, icon: <FaMapMarkerAlt />, color: "yellow" },
        { title: "Tổng số Đánh giá", count: stats.reviews, icon: <FaStar />, color: "red" },
    ];

    return (
        <div className="dashboard-page-container">
            <div className="stats-grid">
                {loading ? (
                    <p>Đang tải dữ liệu...</p>
                ) : (
                    statCards.map((card, index) => <StatCard key={index} {...card} />)
                )}
            </div>
            {/* Bạn có thể thêm các biểu đồ hoặc bảng thông tin khác ở đây */}
        </div>
    );
}