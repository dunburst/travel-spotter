// src/page-staff/Announcements.jsx
import React from 'react';
// Import các icon cần thiết
import { FaRegFileAlt, FaCog } from 'react-icons/fa';

// Dữ liệu mẫu (sau này bạn sẽ lấy từ API)
const mockAnnouncements = [
    {
        icon: <FaRegFileAlt />,
        title: "Chính sách làm việc từ xa mới",
        description: "Phòng Nhân sự đã cập nhật chính sách làm việc từ xa. Vui lòng xem chi tiết trong mục tài liệu.",
        time: "2 giờ trước",
        iconBg: "#e0f2fe" // bg-sky-100
    },
    {
        icon: <FaCog />,
        title: "Bảo trì hệ thống vào cuối tuần",
        description: "Hệ thống sẽ tạm ngưng để bảo trì từ 22:00 Thứ Bảy đến 06:00 Chủ Nhật.",
        time: "1 ngày trước",
        iconBg: "#dcfce7" // bg-green-100
    }
];

const Announcements = () => {
    return (
        <div className="widget-card">
            <h3 className="widget-title">Thông báo từ công ty</h3>
            <div className="announcement-list">
                {mockAnnouncements.map((item, index) => (
                    <div key={index} className="announcement-item">
                        <div className="announcement-icon" style={{ backgroundColor: item.iconBg }}>
                            {item.icon}
                        </div>
                        <div className="announcement-content">
                            <p className="announcement-title">{item.title}</p>
                            <p className="announcement-description">{item.description}</p>
                            <span className="announcement-time">{item.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Announcements;