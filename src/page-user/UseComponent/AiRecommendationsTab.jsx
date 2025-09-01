// src/page-user/UseComponent/AiRecommendationsTab.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toSlug } from "../UserDashboard";

const AiRecommendationsTab = ({ recommendations, isLoading, userLocation, onSearch }) => {
    const navigate = useNavigate();
    const [locationQuery, setLocationQuery] = useState('');

    const handleCardClick = (item) => {
        if (item && item.locationId && item.name) {
            const slug = toSlug(item.name);
            navigate(`/location/${item.locationId}/${slug}`, { state: { userLocation } });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (locationQuery.trim()) {
            onSearch(locationQuery);
        }
    };

    return (
        <div className="ai-recommendations-wrapper">
            <form onSubmit={handleSubmit} className="ai-search-form">
                <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Bạn muốn du lịch ở đâu? (VD: Đà Nẵng)"
                    className="ai-search-input"
                    disabled={isLoading}
                />
                <button type="submit" className="ai-search-button" disabled={isLoading}>
                    Gửi
                </button>
            </form>
            
            {isLoading ? (
                <p>Đang tải đề xuất từ AI...</p>
            ) : !recommendations || recommendations.length === 0 ? (
                <p>Không có đề xuất nào từ AI cho bạn.</p>
            ) : (
                <div className="suggestions-grid">
                    {recommendations.map((item, index) => (
                        <div
                            key={item.locationId || index}
                            className="suggestion-card-v2"
                            onClick={() => handleCardClick(item)}
                        >
                            <div className="card-image-container">
                                <img src="/images/ai.png" alt={item.name} />
                                <div className="card-badge">{item.category?.name || 'Đề xuất'}</div>
                            </div>
                            <div className="card-content">
                                <h4 className="card-title">{item.name}</h4>
                                <p className="card-address">{item.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AiRecommendationsTab;