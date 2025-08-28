// src/page-user/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from 'react-icons/fa';
import MapView from '../components/map/MapView';
import SearchBox from '../components/map/SearchBox';
import PlaceModal from '../components/map/PlaceModal';
import { getAllLocations, getRecommendations, getCurrentUser } from '../services/api';
import './UserDashboard.css';

// --- Helper Functions ---
const haversineDistance = (lat1, lon1, lat2, lon2) => {
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

const FALLBACK_IMAGE_URL = "https://placehold.co/600x400/e2e8f0/64748b?text=TravelSpotter";

// --- Main Component ---
export default function UserDashboard({ onLogout }) {
    // --- State ---
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("");
    const [distance, setDistance] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [showPlaceModal, setShowPlaceModal] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    // --- State for API data ---
    const [allSuggestions, setAllSuggestions] = useState([]);
    const [suggestionsWithDistance, setSuggestionsWithDistance] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);
    const [recommendedPlaces, setRecommendedPlaces] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [user, setUser] = useState(null);

    const [searchHistory, setSearchHistory] = useState(() => JSON.parse(localStorage.getItem("searchHistory")) || []);
    const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("favorites")) || []);

    // --- Modal & Menu Handlers ---
    const openPlaceModal = (item) => { setSelectedPlace(item); setShowPlaceModal(true); };
    const closePlaceModal = () => { setSelectedPlace(null); setShowPlaceModal(false); };
    const toggleUserMenu = () => setShowUserMenu(prev => !prev);

    // Khối useEffect đầu tiên: Lấy thông tin người dùng và địa điểm một lần duy nhất
    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) {
                setUser(storedUser);
            }
            try {
                const locationsRes = await getAllLocations();
                setAllSuggestions(locationsRes?.data?.filter(loc => loc.status === 'ACTIVE') || []);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu địa điểm:", error);
            } finally {
                setLoadingSuggestions(false);
            }
        };

        fetchUserData();
    }, []);

    // Khối useEffect thứ hai: Lấy vị trí và gọi API đề xuất
    useEffect(() => {
        if (!user) {
            return;
        }

        const fetchUserLocationAndRecommendations = async () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        setUserLocation(userLoc);

                        setLoadingRecommendations(true);
                        try {
                            const userProfileRes = await getCurrentUser();
                            const userProfile = userProfileRes.data || userProfileRes;

                            if (!userProfile) {
                                throw new Error("Không lấy được thông tin hồ sơ người dùng.");
                            }

                            const userUpdatePayload = {
                                travelStyles: userProfile.travelStyles || [],
                                interests: userProfile.interests || [],
                                budget: userProfile.budget || "Không rõ",
                                companions: userProfile.companions || [],
                            };
                            
                            // SỬA LỖI TẠI ĐÂY: Dùng đúng key 'userId' từ state 'user'
                            const payload = {
                                accountId: user.userId, // <-- Sửa tại đây
                                location: userLoc,
                                userUpdate: userUpdatePayload,
                            };
                            
                            console.log("Đang gửi payload để lấy đề xuất:", payload);

                            const recRes = await getRecommendations(payload);
                            
                            console.log("Đã nhận được đề xuất:", recRes);
                            setRecommendedPlaces(recRes?.data?.places || []);

                        } catch (recError) {
                            console.error("Lỗi khi lấy đề xuất AI:", recError);
                        } finally {
                            setLoadingRecommendations(false);
                        }
                    },
                    (err) => {
                        console.error("Lỗi khi lấy vị trí (geolocation):", err);
                        setLoadingRecommendations(false);
                    }
                );
            } else {
                console.error("Trình duyệt không hỗ trợ Geolocation.");
                setLoadingRecommendations(false);
            }
        };

        fetchUserLocationAndRecommendations();
    }, [user]);


    const handleSearchByName = async (placeName) => {
        setQuery(placeName);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json`);
            const data = await res.json();
            if (data.length === 0) throw new Error("Không tìm thấy địa điểm");

            const { lat, lon, display_name } = data[0];
            const endCoord = { lat: parseFloat(lat), lng: parseFloat(lon), fullAddress: display_name };

            const updatedHistory = [{ name: placeName, address: endCoord.fullAddress }, ...searchHistory].slice(0, 10);
            setSearchHistory(updatedHistory);
            localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));

            if (!start && userLocation) {
                setStart({ ...userLocation, fullAddress: "Vị trí hiện tại" });
            }
            setEnd(endCoord);
        } catch (error) {
            alert(error.message);
        }
    };

    const toggleFavorite = (place) => {
        let updated;
        const existing = favorites.find(f => f.locationId === place.locationId);
        if (existing) {
            updated = favorites.filter(f => f.locationId !== place.locationId);
        } else {
            updated = [...favorites, place];
        }
        setFavorites(updated);
        localStorage.setItem("favorites", JSON.stringify(updated));
    };

    useEffect(() => {
        if (!userLocation || allSuggestions.length === 0) return;
        const updated = allSuggestions.map(s => ({
            ...s,
            distance: haversineDistance(userLocation.lat, userLocation.lng, s.latitude, s.longitude)
        }));
        setSuggestionsWithDistance(updated);
    }, [userLocation, allSuggestions]);

    const filteredSuggestions = suggestionsWithDistance.filter(s => {
        return (
            (!category || s.category?.name === category) &&
            (!query || s.name.toLowerCase().includes(query.toLowerCase())) &&
            (!distance || (s.distance && s.distance <= parseFloat(distance)))
        );
    });

    const totalPages = Math.ceil(filteredSuggestions.length / itemsPerPage);
    const visibleSuggestions = filteredSuggestions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div className="map-body">
            {showPlaceModal && selectedPlace && (
                <PlaceModal
                    open={showPlaceModal}
                    onClose={closePlaceModal}
                    place={selectedPlace}
                    user={user}
                    userLocation={userLocation}
                    onRoute={(name) => { closePlaceModal(); handleSearchByName(name); }}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={favorites.some(f => f.locationId === selectedPlace.locationId)}
                />
            )}
            <div className="map-header">
                <div className="logo">TravelSpotter</div>
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
                        <h3>Gợi ý địa điểm</h3>
                         <div className="filter-row">
                            <select onChange={(e) => setCategory(e.target.value)}>
                                <option value="">Tất cả danh mục</option>
                                <option value="Ẩm thực">Ẩm thực</option>
                                <option value="Giải trí">Giải trí</option>
                                <option value="Mua sắm">Mua sắm</option>
                                <option value="Thiên nhiên">Thiên nhiên</option>
                            </select>
                            <select onChange={(e) => setDistance(e.target.value)}>
                                <option value="">Khoảng cách</option>
                                <option value="1">Dưới 1 km</option>
                                <option value="2">Dưới 2 km</option>
                                <option value="5">Dưới 5 km</option>
                            </select>
                        </div>
                    </div>

                    <div className="suggestions-grid">
                        {loadingSuggestions || loadingRecommendations ? (
                            <p>Đang tải gợi ý...</p>
                        ) : visibleSuggestions.length > 0 ? (
                            visibleSuggestions.map(item => (
                                <div key={item.locationId} className="suggestion-card-v2" onClick={() => openPlaceModal(item)}>
                                    <div className="card-image-container">
                                        <img src={item.images?.[0] || FALLBACK_IMAGE_URL} alt={item.name} />
                                        <div className="card-badge">{item.category?.name || 'N/A'}</div>
                                        <button 
                                            className={`card-favorite-btn ${favorites.some(f => f.locationId === item.locationId) ? "active" : ""}`} 
                                            onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}>
                                            {favorites.some(f => f.locationId === item.locationId) ? "❤️" : "♡"}
                                        </button>
                                    </div>
                                    <div className="card-content">
                                        <h4 className="card-title">{item.name}</h4>
                                        <div className="card-rating">
                                            <FaStar className="star-icon" />
                                            <span>
                                                {item.averageRating ? item.averageRating.toFixed(1) : 'Chưa có'}
                                                <span className="review-count"> ({item.reviewCount || 0} đánh giá)</span>
                                            </span>
                                        </div>
                                        <p className="card-address">{item.location}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Không tìm thấy gợi ý phù hợp.</p>
                        )}
                    </div>
                    
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>«</button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button key={i} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>
                                {i + 1}
                                </button>
                            ))}
                            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>»</button>
                        </div>
                    )}
                </div>
            </div>
             <div className="map-footer">
                <div onClick={() => alert("Chức năng đang phát triển")}>♡ Yêu thích</div>
                <div onClick={() => alert("Liên hệ hỗ trợ: support@travelspotter.com")}>⚙️ Hỗ trợ</div>
                <button className="sidebar-btn" onClick={() => alert("Chức năng đang phát triển")}>Mở Sidebar</button>
            </div>
        </div>
    );
}