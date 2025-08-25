import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // **THÊM IMPORT NÀY**

// --- Imports ---
import {
    getAllLocations,
    getPendingLocations,
    approveLocation,
    rejectLocation,
    deleteLocation,
    createLocation,
} from '../services/api';

// CSS này có thể chứa style cho Modal, nên ta vẫn giữ lại
import './account-management.css';

// --- Icon Components (Không thay đổi) ---
const CheckCircleIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const XCircleIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const PencilIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);
const TrashIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);

// --- Helper Functions (Không thay đổi) ---
const formatDate = (dateString) => { if (!dateString) return 'N/A'; const date = new Date(dateString); return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
const StatusBadge = ({ status }) => { const statusStyles = { PENDING: { text: 'Chờ duyệt', className: 'status-badge status-pending' }, ACTIVE: { text: 'Đã duyệt', className: 'status-badge status-active' }, INACTIVE: { text: 'Đã từ chối', className: 'status-badge status-inactive' }, }; const statusInfo = statusStyles[status] || { text: status, className: 'status-badge status-default' }; return <span className={statusInfo.className}>{statusInfo.text}</span>; };

// --- Component Form Modal (Không thay đổi) ---
const AddLocationModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({ name: '', description: '', location: '', price: '', openTime: '08:00', closeTime: '22:00', image: '', categoryName: '' });
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); const dataToSend = { ...formData, price: Number(formData.price) || 0 }; onSubmit(dataToSend); };
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="modal-header"><h2 className="modal-title">Thêm địa điểm mới</h2><button type="button" className="modal-close-button" onClick={onClose}>&times;</button></div>
                    <div className="modal-body">
                        <div className="form-group"><label htmlFor="name">Tên địa điểm</label><input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required /></div>
                        <div className="form-group"><label htmlFor="description">Mô tả</label><textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3"></textarea></div>
                        <div className="form-group"><label htmlFor="location">Địa chỉ</label><input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required /></div>
                        <div className="form-group"><label htmlFor="categoryName">Danh mục</label><input type="text" id="categoryName" name="categoryName" value={formData.categoryName} onChange={handleChange} required /></div>
                        <div className="form-grid"><div className="form-group"><label htmlFor="price">Giá (VNĐ)</label><input type="number" id="price" name="price" value={formData.price} onChange={handleChange} /></div><div className="form-group"><label htmlFor="image">Link hình ảnh</label><input type="text" id="image" name="image" value={formData.image} onChange={handleChange} /></div></div>
                        <div className="form-grid"><div className="form-group"><label htmlFor="openTime">Giờ mở cửa</label><input type="time" id="openTime" name="openTime" value={formData.openTime} onChange={handleChange} /></div><div className="form-group"><label htmlFor="closeTime">Giờ đóng cửa</label><input type="time" id="closeTime" name="closeTime" value={formData.closeTime} onChange={handleChange} /></div></div>
                    </div>
                    <div className="modal-footer"><button type="button" className="action-button reject-button" onClick={onClose}>Hủy</button><button type="submit" className="action-button approve-button">Lưu địa điểm</button></div>
                </form>
            </div>
        </div>
    );
};

// --- Main Component ---
export default function LocationManagementPage() {
    // State
    const [allLocations, setAllLocations] = useState([]);
    const [pendingLocations, setPendingLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch dữ liệu
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [allLocationsRes, pendingLocationsRes] = await Promise.all([
                getAllLocations(),
                getPendingLocations(),
            ]);
            
            setAllLocations(allLocationsRes.data);
            setPendingLocations(pendingLocationsRes.data);

        } catch (err) {
            setError(err.message || "Đã xảy ra lỗi không xác định.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Handlers for Actions
    const handleApprove = async (locationId) => { if (!window.confirm("Bạn có chắc chắn muốn duyệt địa điểm này?")) return; try { await approveLocation(locationId); fetchData(); } catch (err) { alert("Lỗi khi duyệt địa điểm: " + err.message); } };
    const handleReject = async (locationId) => { if (!window.confirm("Bạn có chắc chắn muốn từ chối địa điểm này?")) return; try { await rejectLocation(locationId); fetchData(); } catch (err) { alert("Lỗi khi từ chối địa điểm: " + err.message); } };
    const handleDelete = async (locationId) => { if (!window.confirm("Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa địa điểm này?")) return; try { await deleteLocation(locationId); fetchData(); } catch (err) { alert("Lỗi khi xóa địa điểm: " + err.message); } };
    const handleCreateLocation = async (locationData) => { try { await createLocation(locationData); alert("Thêm địa điểm thành công! Nội dung sẽ được gửi đi chờ duyệt."); setIsModalOpen(false); fetchData(); } catch (err) { alert("Lỗi khi thêm địa điểm: " + (err.response?.data?.message || err.message)); } };

    if (loading) return <div className="loading-state">Đang tải dữ liệu...</div>;
    if (error) return <div className="error-state">Lỗi: {error}</div>;

    return (
        <>
            <div className="content-wrapper">
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Địa điểm chờ duyệt ({pendingLocations.length})</h2>
                        <p className="card-description">Danh sách các địa điểm mới hoặc được cập nhật cần phê duyệt.</p>
                    </div>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead className="table-header">
                                <tr>
                                    <th scope="col" className="table-th">Tên địa điểm</th>
                                    <th scope="col" className="table-th">Người tạo</th>
                                    <th scope="col" className="table-th">Ngày tạo</th>
                                    <th scope="col" className="table-th text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {pendingLocations.length > 0 ? (
                                    pendingLocations.map((loc) => (
                                        <tr key={loc.locationId} className="table-row">
                                            <td className="table-td">
                                                <Link to={`/staff/locations/${loc.locationId}`} className="text-link">
                                                    {loc.name}
                                                </Link>
                                            </td>
                                            <td className="table-td">{loc.createdByUsername}</td>
                                            <td className="table-td">{formatDate(loc.createdAt)}</td>
                                            <td className="table-td text-center">
                                                <div className="action-buttons-group">
                                                    <button onClick={() => handleApprove(loc.locationId)} className="action-button approve-button"><CheckCircleIcon className="button-icon" /> Duyệt</button>
                                                    <button onClick={() => handleReject(loc.locationId)} className="action-button reject-button"><XCircleIcon className="button-icon" /> Từ chối</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="empty-state">Không có địa điểm nào đang chờ duyệt.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 className="card-title">Tất cả địa điểm</h2>
                            <p className="card-description">Danh sách toàn bộ địa điểm trên hệ thống.</p>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="action-button approve-button">Thêm địa điểm mới</button>
                    </div>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead className="table-header">
                                <tr>
                                    <th scope="col" className="table-th">Tên địa điểm</th>
                                    <th scope="col" className="table-th">Danh mục</th>
                                    <th scope="col" className="table-th">Người tạo</th>
                                    <th scope="col" className="table-th">Trạng thái</th>
                                    <th scope="col" className="table-th text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {allLocations.map((loc) => (
                                    <tr key={loc.locationId} className="table-row">
                                        <td className="table-td">{loc.name}</td>
                                        <td className="table-td">{loc.categoryName}</td>
                                        <td className="table-td">{loc.createdByUsername}</td>
                                        <td className="table-td"><StatusBadge status={loc.status} /></td>
                                        <td className="table-td text-center">
                                            <div className="action-buttons-group">
                                                <button className="action-button"><PencilIcon className="button-icon" /> Sửa</button>
                                                <button onClick={() => handleDelete(loc.locationId)} className="action-button reject-button"><TrashIcon className="button-icon" /> Xóa</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <AddLocationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateLocation}
            />
        </>
    );
}