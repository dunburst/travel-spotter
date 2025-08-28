// src/page-user/ProfilePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css'; // Sửa lại để import file CSS một cách chính thống

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    if (!user) {
        // Chuyển hướng về trang đăng nhập nếu không có thông tin người dùng
        navigate('/login');
        return null; 
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <button className="back-button" onClick={() => navigate('/user/dashboard')}>
                    ← Quay lại Dashboard
                </button>
                <div className="profile-header">
                    <img 
                        src={`https://api.multiavatar.com/${user.username || 'default'}.png`} 
                        alt="Avatar" 
                        className="profile-avatar"
                    />
                    <h2>{user.username}</h2>
                    <p>Vai trò: {user.role}</p>
                </div>
                <div className="profile-body">
                    <p><strong>UserID:</strong> {user.userId}</p>
                    {/* Bạn có thể thêm các thông tin chi tiết khác của người dùng ở đây */}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
