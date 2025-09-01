// src/page-user/UserDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaStar } from 'react-icons/fa';
import axios from 'axios'; // Thêm import axios
import MapView from '../components/map/MapView';
import SearchBox from '../components/map/SearchBox';
import {
    getAllLocations,
    getRecommendations,
    getCurrentUser,
    getAds,
    getAverageRating,
    getCategories,
    toggleFavorite,
    getFavorites,
    searchLocations
} from '../services/api';
import './UserDashboard.css';

import AdCard from "./UseComponent/AdCard";
import AiRecommendationsTab from "./UseComponent/AiRecommendationsTab";

// --- Helper Functions ---
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
    if ([lat1, lon1, lat2, lon2].some(coord => typeof coord !== 'number')) {
        return null;
    }
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const toSlug = (text) => {
    if (!text) return "";
    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");
};

const FALLBACK_IMAGE_URL = "https://placehold.co/600x400/e2e8f0/64748b?text=TravelSpotter";

// --- Main Component ---
export default function UserDashboard({ onLogout }) {
    // ... (các state khác giữ nguyên) ...
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("");
    const [distance, setDistance] = useState("");
    const [ratingsFilter, setRatingsFilter] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('suggestions');

    // --- State for API data ---
    const [allSuggestions, setAllSuggestions] = useState([]);
    const [suggestionsWithDistance, setSuggestionsWithDistance] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);
    const [recommendedPlaces, setRecommendedPlaces] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [user, setUser] = useState(null);
    const [ads, setAds] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ratings, setRatings] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const [searchHistory, setSearchHistory] = useState(() => JSON.parse(localStorage.getItem("searchHistory")) || []);
    const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("favorites")) || []);

    const toggleUserMenu = () => setShowUserMenu(prev => !prev);
    
    // ... (các useEffect và hàm khác giữ nguyên) ...

    useEffect(() => {
        const fetchInitialData = async () => {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) {
                setUser(storedUser);
            }
            try {
                const [categoriesRes, adsRes] = await Promise.all([
                    getCategories(),
                    getAds()
                ]);
                setCategories(categoriesRes.data || []);
                const activeAds = (adsRes.data || []).filter(ad => ad.status === 'ACTIVE').map(ad => ({ ...ad, isAd: true }));
                setAds(activeAds);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu ban đầu:", error);
                setCategories([]);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchLocationsAndUserLocation = async () => {
            setIsLoading(true);
            try {
                const locationsRes = await getAllLocations();
                const activeLocations = locationsRes?.data?.filter(loc => loc.status === 'ACTIVE') || [];
                setAllSuggestions(activeLocations);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu địa điểm:", error);
            } finally {
                setLoadingSuggestions(false);
            }

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        setUserLocation(userLoc);
                    },
                    (err) => {
                        console.error("Lỗi khi lấy vị trí (geolocation):", err);
                        alert("Vui lòng bật GPS để sử dụng đầy đủ tính năng.");
                    }
                );
            } else {
                console.error("Trình duyệt không hỗ trợ Geolocation.");
            }
            setIsLoading(false);
        };
        fetchLocationsAndUserLocation();
    }, []);

    // **BẮT ĐẦU THAY ĐỔI**
    // Hàm xử lý lấy đề xuất AI ban đầu theo vị trí GPS
    const fetchInitialRecommendations = useCallback(async (currentLocation) => {
        if (!user || !currentLocation) return;
        setLoadingRecommendations(true);
        try {
            const userProfileRes = await getCurrentUser();
            const userProfile = userProfileRes.data || userProfileRes;
            if (!userProfile) throw new Error("Không lấy được thông tin hồ sơ người dùng.");

            const userUpdatePayload = {
                travelStyles: userProfile.travelStyles || [],
                interests: userProfile.interests || [],
                budget: userProfile.budget || "Không rõ",
                companions: userProfile.companions || [],
            };
            const payload = {
                accountId: user.userId,
                location: currentLocation,
                userUpdate: userUpdatePayload,
            };
            const recRes = await getRecommendations(payload);
            setRecommendedPlaces(recRes?.data?.places || []);
        } catch (recError) {
            console.error("Lỗi khi lấy đề xuất AI ban đầu:", recError);
        } finally {
            setLoadingRecommendations(false);
        }
    }, [user]);

    // Gọi API đề xuất ban đầu khi có vị trí người dùng
    useEffect(() => {
        if (userLocation) {
            fetchInitialRecommendations(userLocation);
        }
    }, [userLocation, fetchInitialRecommendations]);

    // Hàm xử lý tìm kiếm đề xuất AI theo địa điểm người dùng nhập
    const handleAiSearch = useCallback(async (query) => {
        if (!query || !user) return;
        setLoadingRecommendations(true);
        try {
            // 1. Chuyển đổi tên địa điểm thành tọa độ (Geocoding)
            const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
            const geocodeRes = await axios.get(geocodeUrl);
            if (!geocodeRes.data || geocodeRes.data.length === 0) {
                throw new Error("Không thể tìm thấy tọa độ cho địa điểm bạn đã nhập.");
            }
            const { lat, lon } = geocodeRes.data[0];
            const newLocation = { lat: parseFloat(lat), lng: parseFloat(lon) };

            // 2. Gọi lại hàm lấy đề xuất với tọa độ mới
            await fetchInitialRecommendations(newLocation);

        } catch (err) {
            console.error("Lỗi khi lấy đề xuất AI theo địa điểm:", err);
            alert(err.message);
            setLoadingRecommendations(false); // Đảm bảo tắt loading khi có lỗi
        }
    }, [user, fetchInitialRecommendations]);
    // **KẾT THÚC THAY ĐỔI**
    
    useEffect(() => {
        if (!userLocation || allSuggestions.length === 0) return;
        const updated = allSuggestions.map(s => ({
            ...s,
            distance: haversineDistance(userLocation.lat, userLocation.lng, s.latitude, s.longitude)
        }));
        setSuggestionsWithDistance(updated);
        updated.forEach(s => {
            fetchAverageRating(s.locationId);
        });
    }, [userLocation, allSuggestions]);
    
    const fetchAverageRating = async (placeId) => {
        try {
            const response = await getAverageRating(placeId);
            const avg = response.data; 

            if (typeof avg === 'number' && !isNaN(avg)) {
                setRatings(prev => ({ ...prev, [placeId]: Number(avg.toFixed(1)) }));
            } else {
                setRatings(prev => ({ ...prev, [placeId]: 0 }));
            }
        } catch (e) {
            console.error(`Không lấy được rating cho địa điểm ${placeId}:`, e.message);
            setRatings(prev => ({ ...prev, [placeId]: 0 }));
        }
    };

    const handleSearchByName = useCallback(async (placeName) => {
        if (isLoading) {
          alert("Đang tải dữ liệu, vui lòng chờ...");
          return;
        }
        if (!userLocation || !userLocation.lat) {
            alert("Không xác định được vị trí hiện tại. Vui lòng bật GPS hoặc chờ vị trí được tải.");
            return;
        }
        try {
            setIsLoading(true);
            const data = await searchLocations(placeName);
            if (data.data.length === 0) throw new Error("Không tìm thấy địa điểm.");
            const endPlace = data.data[0];
            const endCoord = {
                lat: endPlace.latitude,
                lng: endPlace.longitude,
                fullAddress: endPlace.location,
            };
            setSearchHistory(prev => {
                const updated = [{ name: placeName, address: endCoord.fullAddress }, ...prev].slice(0, 10);
                localStorage.setItem("searchHistory", JSON.stringify(updated));
                return updated;
            });
            setStart({
                lat: userLocation.lat,
                lng: userLocation.lng,
                fullAddress: "Vị trí hiện tại",
            });
            setEnd(endCoord);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, userLocation]);

    const handleToggleFavorite = async (place) => {
        try {
          await toggleFavorite(place.locationId);
          const updatedFavoritesRes = await getFavorites();
          const updatedFavorites = updatedFavoritesRes.data || updatedFavoritesRes;
          setFavorites(updatedFavorites);
          localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
        } catch (e) {
          console.error("Lỗi khi thay đổi yêu thích:", e);
          alert("Không thể thay đổi trạng thái yêu thích. Vui lòng thử lại.");
        }
      };

    const filteredSuggestions = suggestionsWithDistance.filter(s => {
        const avgRating = ratings[s.locationId];
        return (
            (!category || (s.categoryNames && s.categoryNames.includes(category))) &&
            (!query || s.name.toLowerCase().includes(query.toLowerCase())) &&
            (!distance || (s.distance && s.distance <= parseFloat(distance))) &&
            (!ratingsFilter || (avgRating !== undefined && avgRating >= parseFloat(ratingsFilter)))
        );
    });

    const visibleSuggestions = useMemo(() => {
        const merged = [...ads, ...filteredSuggestions];
        const startIndex = (currentPage - 1) * itemsPerPage;
        return merged.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSuggestions, ads, currentPage, itemsPerPage]);

    const totalPages = Math.ceil((filteredSuggestions.length + ads.length) / itemsPerPage);

    return (
        <div className="map-body">
            {/* ... (Phần map-header và map-layout không đổi) ... */}
            <div className="map-header">
                <div className="logo">TravelSuggest</div>
                <SearchBox
                    onSearch={(s, e) => { setStart(s); setEnd(e); }}
                    setStart={setStart}
                    query={query}
                    setQuery={setQuery}
                />
                <div className="user-section">
                    <div className="user-icon" onClick={toggleUserMenu}>👤</div>
                    {showUserMenu && (
                        <div className="user-menu">
                            <div className="user-name">{user?.username || "Khách"}</div>
                            <button className="profile-btn" onClick={() => navigate("/profile")}>Hồ sơ cá nhân</button>
                            <button className="logout-btn" onClick={onLogout}>Đăng xuất</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="map-layout">
                <div className="map-left">
                    <div className="map-view">
                        <MapView start={start} end={end} recommendedPlaces={recommendedPlaces} />
                    </div>
                </div>
                <div className="map-right">
                    <div className="suggestions-header">
                        <div className="tabs-container">
                             <button
                                className={`tab-button ${activeTab === 'suggestions' ? 'active' : ''}`}
                                onClick={() => setActiveTab('suggestions')}
                            >
                                Gợi ý địa điểm
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
                                onClick={() => setActiveTab('ai')}
                            >
                                Đề xuất bởi AI
                            </button>
                        </div>
                       {activeTab === 'suggestions' && (
                           <>
                                <div className="filter-row">
                                    <select onChange={(e) => setCategory(e.target.value)}>
                                        <option value="">Tất cả danh mục</option>
                                        {Array.isArray(categories) && categories.map(c => (
                                            <option key={c.categoryId} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                    <select onChange={(e) => setDistance(e.target.value)}>
                                        <option value="">Khoảng cách</option>
                                        <option value="1">Dưới 1 km</option>
                                        <option value="2">Dưới 2 km</option>
                                        <option value="5">Dưới 5 km</option>
                                    </select>
                                </div>
                                <div className="filter-row">
                                    <select onChange={(e) => setRatingsFilter(e.target.value)}>
                                        <option value="">Đánh giá</option>
                                        <option value="3">3 ⭐ trở lên</option>
                                        <option value="4">4 ⭐ trở lên</option>
                                    </select>
                                </div>
                           </>
                       )}
                    </div>
                    
                    {activeTab === 'suggestions' ? (
                        <>
                            <div className="suggestions-grid">
                                {loadingSuggestions ? (
                                    <p>Đang tải gợi ý...</p>
                                ) : visibleSuggestions.length > 0 ? (
                                    visibleSuggestions.map(item => (
                                        item.isAd ? (
                                            <AdCard 
                                                key={`ad-${item.adId}`} 
                                                ad={item}
                                                onRoute={handleSearchByName}
                                                onCall={(name) => alert(`Chức năng gọi điện cho ${name} đang phát triển.`)}
                                                onNavigate={navigate}
                                            />
                                        ) : (
                                            <div
                                                key={item.locationId}
                                                className="suggestion-card-v2"
                                                onClick={() => {
                                                     const slug = toSlug(item.name);
                                                     navigate(`/location/${item.locationId}/${slug}`, { state: { userLocation } });
                                                }}
                                            >
                                                <div className="card-image-container">
                                                    <img src={item.images?.[0] || FALLBACK_IMAGE_URL} alt={item.name} />
                                                    <div className="card-badge">{item.categoryNames?.join(', ') || 'N/A'}</div>
                                                    <button
                                                        className={`card-favorite-btn ${favorites.some(f => f.locationName === item.name) ? "active" : ""}`}
                                                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(item); }}>
                                                        {favorites.some(f => f.locationName === item.name) ? "❤️" : "♡"}
                                                    </button>
                                                </div>
                                                <div className="card-content">
                                                    <h4 className="card-title">{item.name}</h4>
                                                    <div className="card-rating">
                                                        <FaStar className="star-icon" />
                                                        <span>
                                                            {ratings[item.locationId] ? ratings[item.locationId].toFixed(1) : 'Chưa có'}
                                                        </span>
                                                    </div>
                                                    <p className="card-address">{item.location}</p>
                                                </div>
                                            </div>
                                        )
                                    ))
                                ) : (
                                    <p>Không tìm thấy gợi ý phù hợp.</p>
                                )}
                            </div>
                            <div className="pagination">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>◀</button>
                                <span>Trang {currentPage}</span>
                                <button disabled={visibleSuggestions.length < itemsPerPage || totalPages === currentPage} onClick={() => setCurrentPage(p => p + 1)}>▶</button>
                            </div>
                        </>
                    ) : (
                        <AiRecommendationsTab 
                            recommendations={recommendedPlaces} 
                            isLoading={loadingRecommendations}
                            userLocation={userLocation}
                            onSearch={handleAiSearch} // Truyền hàm xử lý xuống component con
                        />
                    )}
                </div>
            </div>
             <div className="map-footer">
                <div onClick={() => navigate("/profile", { state: { initialTab: 1 } })}>♡ Yêu thích</div>
                <div onClick={() => navigate("/support")}>⚙️ Hỗ trợ</div>
                <button className="sidebar-btn" onClick={() => navigate("/profile")}>Xem Hồ sơ</button>
            </div>
        </div>
    );
}