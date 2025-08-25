// src/page-staff/LocationDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { 
    FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaGlobe, FaPhone, 
    FaUser, FaTag, FaCalendarAlt, FaExternalLinkAlt, FaCheckCircle, FaTimesCircle 
} from 'react-icons/fa';
import { getPendingLocationDetail, approveLocation, rejectLocation } from '../services/api';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './LocationDetailPage.css'; // Đã di chuyển lên đây

// --- SỬA LỖI ICON ---
// Đoạn code này phải nằm sau tất cả các dòng import
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// --- Helper Components (Không thay đổi) ---
const InfoCard = ({ title, children }) => (
    <div className="info-card">
        <h3 className="info-card__title">{title}</h3>
        <div className="info-card__content">{children}</div>
    </div>
);

const InfoRow = ({ icon, label, value, isLink = false }) => {
    if (!value) return null;
    return (
        <div className="info-row">
            <div className="info-row__icon">{icon}</div>
            <div className="info-row__text">
                <span className="info-row__label">{label}</span>
                {isLink ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="info-row__value info-row__link">
                        {value} <FaExternalLinkAlt size={12} />
                    </a>
                ) : (
                    <span className="info-row__value">{value}</span>
                )}
            </div>
        </div>
    );
};


// --- Main Component (Không thay đổi logic) ---
export default function LocationDetailPage() {
    const { locationId } = useParams();
    const navigate = useNavigate();

    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
    const [mapLoading, setMapLoading] = useState(true);
    const [mapError, setMapError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getPendingLocationDetail(locationId);
            setDetails(response.data.result);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Không thể tải chi tiết địa điểm.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [locationId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (details?.location) {
            const getCoordinates = async () => {
                setMapLoading(true);
                setMapError(null);
                try {
                    const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(details.location)}`);
                    if (response.data && response.data.length > 0) {
                        const { lat, lon } = response.data[0];
                        setCoordinates([parseFloat(lat), parseFloat(lon)]);
                    } else {
                        throw new Error("Không tìm thấy tọa độ cho địa chỉ này.");
                    }
                } catch (err) {
                    setMapError("Lỗi khi tải dữ liệu bản đồ. Vui lòng thử lại.");
                    console.error("Geocoding error:", err);
                } finally {
                    setMapLoading(false);
                }
            };
            getCoordinates();
        }
    }, [details?.location]);

    const handleApprove = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn DUYỆT địa điểm này?")) return;
        try {
            await approveLocation(locationId);
            alert("Duyệt địa điểm thành công!");
            navigate('/staff/locations');
        } catch (err) {
            alert("Lỗi khi duyệt địa điểm: " + (err.response?.data?.message || err.message));
        }
    };

    const handleReject = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn TỪ CHỐI địa điểm này?")) return;
        try {
            await rejectLocation(locationId);
            alert("Từ chối địa điểm thành công!");
            navigate('/staff/locations');
        } catch (err) {
            alert("Lỗi khi từ chối địa điểm: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div className="loading-state">Đang tải chi tiết...</div>;
    if (error) return <div className="error-state">Lỗi: {error}</div>;
    if (!details) return <div className="empty-state">Không tìm thấy thông tin.</div>;
    
    const coverImage = details.images && details.images.length > 0 ? details.images[0] : '/images/default-location-image.png';

    return (
        <div className="location-detail-page">
            <div className="detail-header" style={{ backgroundImage: `url(${coverImage})` }}>
                <div className="detail-header__overlay">
                    <h1 className="detail-header__title">{details.name}</h1>
                    <p className="detail-header__address"><FaMapMarkerAlt /> {details.location}</p>
                    <div className="detail-header__actions">
                        <button onClick={handleReject} className="action-button-v2 reject"><FaTimesCircle /> Từ chối</button>
                        <button onClick={handleApprove} className="action-button-v2 approve"><FaCheckCircle /> Duyệt</button>
                    </div>
                </div>
            </div>

            <div className="detail-main-content">
                <div className="detail-content-left">
                    <InfoCard title="Mô tả chi tiết">
                        <p className="location-description">{details.description || "Chưa có mô tả."}</p>
                    </InfoCard>

                    <InfoCard title="Vị trí trên bản đồ">
                        {mapLoading && <p>Đang tải bản đồ...</p>}
                        {mapError && <p style={{ color: 'red' }}>{mapError}</p>}
                        {coordinates && !mapLoading && !mapError && (
                            <MapContainer center={coordinates} zoom={16} scrollWheelZoom={false} style={{ height: '400px', width: '100%', borderRadius: '8px' }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={coordinates}>
                                    <Popup>{details.name}</Popup>
                                </Marker>
                            </MapContainer>
                        )}
                    </InfoCard>

                    {details.images && details.images.length > 0 && (
                        <InfoCard title="Thư viện hình ảnh">
                            <div className="image-gallery">
                                {details.images.map((img, index) => (
                                    <div key={index} className="gallery-item" onClick={() => setSelectedImage(img)}>
                                        <img src={img} alt={`Hình ảnh ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </InfoCard>
                    )}
                </div>

                <div className="detail-content-right">
                    <InfoCard title="Thông tin chung">
                        <InfoRow icon={<FaTag />} label="Danh mục" value={details.categoryName} />
                        <InfoRow icon={<FaClock />} label="Giờ hoạt động" value={details.openTime && details.closeTime ? `${details.openTime} - ${details.closeTime}` : "Chưa cập nhật"} />
                        <InfoRow icon={<FaMoneyBillWave />} label="Giá tham khảo" value={details.price ? `${details.price.toLocaleString('vi-VN')} VNĐ` : "Chưa cập nhật"} />
                        <InfoRow icon={<FaPhone />} label="Số điện thoại" value={details.phoneNumber} />
                        <InfoRow icon={<FaGlobe />} label="Website" value={details.website} isLink={true} />
                    </InfoCard>
                    <InfoCard title="Thông tin kiểm duyệt">
                         <InfoRow icon={<FaUser />} label="Người tạo" value={details.createdByUsername} />
                         <InfoRow icon={<FaCalendarAlt />} label="Ngày tạo" value={new Date(details.createdAt).toLocaleDateString('vi-VN')} />
                         <div className="info-row">
                            <div className="info-row__icon"></div>
                            <div className="info-row__text">
                                <span className="info-row__label">Trạng thái</span>
                                <span className="status-badge status-pending">Chờ duyệt</span>
                            </div>
                        </div>
                    </InfoCard>
                </div>
            </div>

            {selectedImage && (
                <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Xem ảnh lớn" className="image-modal-content" />
                    <button className="image-modal-close">×</button>
                </div>
            )}
        </div>
    );
}