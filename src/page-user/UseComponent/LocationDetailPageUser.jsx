// src/page-user/UseComponent/LocationDetailPageUser.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaGlobe, FaPhone,
    FaUser, FaTag, FaCalendarAlt, FaExternalLinkAlt, FaCheckCircle,
    FaTimesCircle, FaPlayCircle, FaStar
} from 'react-icons/fa';
import { haversineDistance, toSlug } from '../UserDashboard';
import {
    getLocationById, getReviewsByLocation, getAverageRating,
    toggleFavorite, getFavorites, writeReview,
    getCurrentUser, getLocationDetail // **THÊM IMPORT TẠI ĐÂY**
} from '../../services/api';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './LocationDetailPageUser.css';



delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

const InfoCard = ({ title, children }) => (
    <div className="info-card">
        <h3 className="info-card__title">{title}</h3>
        <div className="info-card__content">
            {children}
        </div>
    </div>
);

const InfoRow = ({ icon, label, children }) => (
    <div className="info-row">
        <span className="info-row__icon">{icon}</span>
        <span className="info-row__label">{label}:</span>
        <span className="info-row__value">{children}</span>
    </div>
);

const StarRating = ({ rating }) => (
    <div className="rating-stars">
        {[...Array(5)].map((_, i) => (
            <FaStar key={i} className={i < rating ? "star-filled" : "star-empty"} />
        ))}
    </div>
);

export default function LocationDetailPageUser() {
    const { locationId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { userLocation } = location.state || {};
    const [details, setDetails] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [myFavorites, setMyFavorites] = useState([]);

    const calculatedDistance = useMemo(() => {
        if (userLocation && details && details.latitude && details.longitude) {
            return haversineDistance(
                userLocation.lat,
                userLocation.lng, 
                details.latitude,
                details.longitude
            );
        }
        return null;
    }, [userLocation, details]);
    
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const user = await getCurrentUser();
                setCurrentUser(user.data || user);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
            }
        };
        fetchUserProfile();
    }, []);

    const handleToggleFavorite = useCallback(async () => {
        if (!details) return;
        try {
            await toggleFavorite(details.locationId);
            const favs = await getFavorites();
            setMyFavorites(favs.data || []);
        } catch (error) {
            console.error("Lỗi khi cập nhật yêu thích:", error);
        }
    }, [details]);

    const handleAddReview = async () => {
        if (!details) return;
        try {
            if (newRating === 0 || newComment === "") {
                alert("Vui lòng nhập đầy đủ sao và bình luận.");
                return;
            }
            await writeReview({
                locationId: details.locationId,
                rating: newRating,
                comment: newComment,
            });
            alert("Bình luận của bạn đã được gửi và đang chờ duyệt!");
            setNewRating(0);
            setNewComment("");
            fetchLocationReviews();
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error);
            alert("Lỗi khi gửi đánh giá: " + (error.response?.data?.message || error.message));
        }
    };

    const fetchLocationReviews = useCallback(async () => {
        try {
            const fetchedReviews = await getReviewsByLocation(locationId);
            setReviews(fetchedReviews.data || []);
            const avgRatingRes = await getAverageRating(locationId);
            setAverageRating(avgRatingRes.data || 0);
        } catch (e) {
            console.error("Lỗi khi tải reviews:", e);
        }
    }, [locationId]);

    const handleCheckFavorite = useCallback(async (id) => {
        try {
            const favoritesList = await getFavorites();
            setMyFavorites(favoritesList.data || []);
            const isFav = (favoritesList.data || []).some(fav => fav.locationId === id);
            setIsFavorite(isFav);
        } catch (e) {
            console.error("Lỗi khi kiểm tra yêu thích:", e);
        }
    }, []);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await getLocationDetail(locationId); // Sử dụng getLocationDetail ở đây
                const data = response.data;
                setDetails(data);
                handleCheckFavorite(data.locationId);
                fetchLocationReviews();
            } catch (e) {
                setError(e);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [locationId, fetchLocationReviews, handleCheckFavorite]);

    useEffect(() => {
        setIsFavorite((myFavorites || []).some(fav => fav.locationId === details?.locationId));
    }, [myFavorites, details]);

    if (loading) return <div className="loading-state">Đang tải dữ liệu...</div>;
    if (error) return <div className="error-state">Không tìm thấy địa điểm này.</div>;
    if (!details) return <div className="empty-state">Không có dữ liệu chi tiết.</div>;

    const mainImage = details.images?.[0] || "https://via.placeholder.com/1400x300?text=No+Image";

    const handleRoute = () => {
        if (details.latitude && details.longitude) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${details.latitude},${details.longitude}&travelmode=driving`;
            window.open(url, '_blank');
        } else {
            alert("Không có thông tin tọa độ để chỉ đường.");
        }
    };

    return (
        <div className="location-detail-page">
            <div
                className="detail-header"
                style={{ backgroundImage: `url(${mainImage})` }}
            >
                <button className="back-btn" onClick={() => navigate(-1)}>← Quay lại</button>
                <div className="detail-header__overlay">
                    <h1 className="detail-header__title">{details.name}</h1>
                    <p className="detail-header__address"><FaMapMarkerAlt /> {details.location}</p>
                </div>
            </div>

            <div className="detail-content">
                <div className="main-info">
                    <InfoCard title="Thông tin cơ bản">
                        <InfoRow icon={<FaTag />} label="Thể loại">{details.categoryNames?.join(', ') || "N/A"}</InfoRow>
                        <InfoRow icon={<FaClock />} label="Giờ mở cửa">{details.openTime && details.closeTime ? `${details.openTime} - ${details.closeTime}` : "Chưa cập nhật"}</InfoRow>
                        <InfoRow icon={<FaMoneyBillWave />} label="Giá vé">{details.price ? `${details.price.toLocaleString('vi-VN')} VNĐ` : "Miễn phí"}</InfoRow>
                        <InfoRow icon={<FaGlobe />} label="Website">
                            {details.website ? (
                                <a href={details.website} target="_blank" rel="noopener noreferrer">
                                    {details.website} <FaExternalLinkAlt size={12} />
                                </a>
                            ) : "Chưa cập nhật"}
                        </InfoRow>
                        <InfoRow icon={<FaPhone />} label="Điện thoại">{details.phoneNumber || "Chưa cập nhật"}</InfoRow>
                        {userLocation && (
                            <InfoRow icon={<FaMapMarkerAlt />} label="Khoảng cách">
                                {calculatedDistance !== null ? `${calculatedDistance.toFixed(1)} km` : "Đang tính..."}
                            </InfoRow>
                        )}
                    </InfoCard>

                    <InfoCard title="Mô tả">
                        <p className="description">{details.description}</p>
                    </InfoCard>

                    <InfoCard title="Bản đồ">
                        {details.latitude && details.longitude && (
                            <MapContainer
                                center={[details.latitude, details.longitude]}
                                zoom={15}
                                style={{ height: '400px', width: '100%', borderRadius: '8px' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[details.latitude, details.longitude]}>
                                    <Popup>{details.name}</Popup>
                                </Marker>
                            </MapContainer>
                        )}
                    </InfoCard>

                    <div className="user-actions">
                        <button
                            className={`favorite-btn ${isFavorite ? "active" : ""}`}
                            onClick={handleToggleFavorite}
                        >
                            {isFavorite ? "❤️ Đã yêu thích" : "♡ Yêu thích"}
                        </button>
                        <button
                            className="go-btn"
                            onClick={handleRoute}
                            disabled={!userLocation}
                            title={!userLocation ? "Vui lòng cho phép định vị để chỉ đường" : "Chỉ đường tới địa điểm này"}
                        >
                            🚗 Chỉ đường
                        </button>
                    </div>

                    <InfoCard title="Ảnh & Video">
                        <div className="media-gallery">
                            {details.images?.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={details.name}
                                    className="media-thumbnail"
                                    onClick={() => setSelectedMedia({ type: 'image', url: img })}
                                />
                            ))}
                        </div>
                    </InfoCard>

                    <InfoCard title="Đánh giá & Bình luận">
                        <div className="average-rating-display">
                            <h3>
                                <StarRating rating={Math.round(averageRating)} />
                                 
                                {averageRating.toFixed(1)} / 5.0
                            </h3>
                        </div>

                        <div className="review-form">
                            <h4>Viết đánh giá của bạn</h4>
                            <div className="rating-input">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar
                                        key={i}
                                        className={i < newRating ? "star-filled" : "star-empty"}
                                        onClick={() => setNewRating(i + 1)}
                                        style={{ cursor: "pointer" }}
                                    />
                                ))}
                            </div>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Viết bình luận của bạn tại đây..."
                                rows="3"
                            />
                            <button className="submit-review-btn" onClick={handleAddReview}>
                                Gửi đánh giá
                            </button>
                        </div>
                        <div className="review-list">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review.reviewId} className="review-item">
                                        <div className="review-item__header">
                                            <div className="review-item__author">
                                                {review.username}
                                                {currentUser && review.accountId === currentUser.accountId && (
                                                    <span className="review-you-tag"> (Bạn)</span>
                                                )}
                                            </div>
                                            <div className="review-item__timestamp">
                                                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi })}
                                            </div>
                                        </div>
                                        <div className="review-item__rating">
                                            <StarRating rating={review.rating} />
                                        </div>
                                        <p className="review-item__comment">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p>Chưa có đánh giá nào cho địa điểm này.</p>
                            )}
                        </div>
                    </InfoCard>

                    {selectedMedia && (
                        <div className="media-modal-overlay" onClick={() => setSelectedMedia(null)}>
                            <div className="media-modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
                                {selectedMedia.type === 'image' ? (
                                    <img src={selectedMedia.url} alt="Xem ảnh lớn" className="media-modal-content" />
                                ) : (
                                    <video src={selectedMedia.url} controls autoPlay className="media-modal-content" />
                                )}
                            </div>
                            <button className="media-modal-close" onClick={() => setSelectedMedia(null)}>×</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}