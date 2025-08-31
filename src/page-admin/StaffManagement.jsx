// src/page-admin/StaffManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
    getAllStaffAccounts, 
    createAccount, 
    updateAccount, 
    deleteAccount 
} from '../services/api';
import '../page-staff/account-management.css'; // Tái sử dụng CSS

// --- Helper Components ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const StatusBadge = ({ status }) => {
    const statusInfo = {
        ACTIVE: { text: 'Hoạt động', className: 'status-badge status-active' },
        INACTIVE: { text: 'Ngừng hoạt động', className: 'status-badge status-inactive' },
    }[status] || { text: status, className: 'status-badge status-default' };
    return <span className={statusInfo.className}>{statusInfo.text}</span>;
};

// --- Modal for Add/Edit Staff ---
const StaffModal = ({ isOpen, onClose, onSave, staff }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    useEffect(() => {
        if (staff) {
            setFormData({ username: staff.username, email: staff.email, password: '' });
        } else {
            setFormData({ username: '', email: '', password: '' });
        }
    }, [staff]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">{staff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</h3>
                    <button onClick={onClose} className="modal-close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="username">Tên đăng nhập</label>
                            <input id="username" name="username" value={formData.username} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            {/* === DÒNG SỬA LỖI DUY NHẤT LÀ DÒNG INPUT DƯỚI ĐÂY === */}
                            <input 
                                id="password" 
                                name="password" 
                                type="password" 
                                placeholder={staff ? 'Để trống nếu không đổi' : ''} 
                                required={!staff} 
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
                        <button type="submit" className="btn btn-primary">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Component ---
export default function StaffManagementPage() {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllStaffAccounts();
            setStaffList(response.data);
        } catch (err) {
            setError(err.message || "Đã xảy ra lỗi khi tải danh sách nhân viên.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (staff = null) => {
        setEditingStaff(staff);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingStaff(null);
        setIsModalOpen(false);
    };

    const handleSaveStaff = async (formData) => {
        try {
            if (editingStaff) { // Cập nhật
                const payload = { ...formData };
                if (!payload.password) {
                    delete payload.password; // Không gửi mật khẩu nếu không thay đổi
                }
                await updateAccount(editingStaff.accountId, payload);
            } else { // Thêm mới
                await createAccount({ ...formData, role: 'STAFF' });
            }
            fetchData();
            handleCloseModal();
        } catch (err) {
            alert("Lỗi: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteStaff = async (staffId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
            try {
                await deleteAccount(staffId);
                fetchData();
            } catch (err) {
                alert("Lỗi khi xóa nhân viên: " + err.message);
            }
        }
    };

    if (loading) return <div className="loading-state">Đang tải...</div>;
    if (error) return <div className="error-state">Lỗi: {error}</div>;

    return (
        <div className="content-wrapper">
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 className="card-title">Quản lý Nhân viên</h2>
                        <p className="card-description">Danh sách các tài khoản nhân viên trong hệ thống.</p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="action-button approve-button">Thêm Nhân viên</button>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Nhân viên</th>
                                <th className="table-th">Ngày tạo</th>
                                <th className="table-th">Trạng thái</th>
                                <th className="table-th text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {staffList.length > 0 ? (
                                staffList.map(staff => (
                                    <tr key={staff.accountId} className="table-row">
                                        <td className="table-td">
                                            <div className="font-medium">{staff.username}</div>
                                            <div className="text-gray-500">{staff.email}</div>
                                        </td>
                                        <td className="table-td">{formatDate(staff.createdAt)}</td>
                                        <td className="table-td"><StatusBadge status={staff.status} /></td>
                                        <td className="table-td text-center">
                                            <div className="action-buttons-group">
                                                <button onClick={() => handleOpenModal(staff)} className="action-button">Sửa</button>
                                                <button onClick={() => handleDeleteStaff(staff.accountId)} className="action-button reject-button">Xóa</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="empty-state">Chưa có nhân viên nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <StaffModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveStaff} staff={editingStaff} />
        </div>
    );
}