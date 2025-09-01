import React from 'react';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { toSlug } from "../UserDashboard";

const AdCard = ({ ad, onRoute, onCall, onNavigate }) => {
    const handleRouteClick = (e) => {
        e.stopPropagation();
        onRoute(ad.locationName);
    };

    const handleCallClick = (e) => {
        e.stopPropagation();
        onCall(ad.locationName);
    };

    const handleCardClick = () => {
        // Chuyển hướng đến trang chi tiết của địa điểm được quảng cáo
        if (ad.locationId) {
            const slug = toSlug(ad.locationName);
            onNavigate(`/location/${ad.locationId}/${slug}`);
        }
    };

    return (
        <div className="ad-card-v2" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <span className="ad-card__tag">Quảng cáo</span>
            <div className="ad-card__main-content">
                <img 
                    src={ad.locationImages?.[0] || "https://placehold.co/64x64/e2e8f0/64748b?text=Ảnh"} 
                    alt={ad.locationName} 
                    className="ad-card__image" 
                />
                <div className="ad-card__info">
                    <h4>{ad.locationName}</h4>
                    <p className="ad-card__slogan">"{ad.title}"</p>
                    <div className="ad-card__details">
                        <span className="ad-card__rating">
                            <FaStar style={{ color: '#f59e0b' }} /> 
                            {ad.averageRating ? ad.averageRating.toFixed(1) : 'N/A'} ({ad.totalReviews || 0} đánh giá)
                        </span>
                        <span className="ad-card__address">
                            <FaMapMarkerAlt /> {ad.locationAddress}
                        </span>
                    </div>
                </div>
            </div>
            <div className="ad-card__actions">
                {ad.actions && ad.actions.includes('GUIDE') && (
                    <button className="ad-card__btn ad-card__btn--primary" onClick={handleRouteClick}>
                        Chỉ đường
                    </button>
                )}
                {ad.actions && ad.actions.includes('CALL') && (
                     <button className="ad-card__btn ad-card__btn--secondary" onClick={handleCallClick}>
                        Gọi ngay
                    </button>
                )}
            </div>
        </div>
    );
};

export default AdCard;