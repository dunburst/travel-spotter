import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  CircularProgress
} from "@mui/material";
import ProfileInfo from "./ProfileInfo";
import FavoritesTab from "./FavoritesTab";
import HistoryTab from "./HistoryTab";
import SettingsTab from "./SettingsTab";
// **BẮT ĐẦU THAY ĐỔI**
import { getCurrentUser, updateUserProfile , getFavorites, updateAvatar } from "../../services/api";
// **KẾT THÚC THAY ĐỔI**

const Profile = () => {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [language, setLanguage] = useState("vi");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [userLocation, setUserLocation] = useState(location.state?.userLocation || null);
  const [isLoading, setIsLoading] = useState(location.state?.isLoading || false);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [tab, setTab] = useState(location.state?.initialTab || 0);

  useEffect(() => {
    if (!userLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          console.warn("Không lấy được vị trí user");
          alert("Không thể lấy vị trí của bạn. Hãy thử lại hoặc nhập thủ công.");
        }
      );
    }
  }, [userLocation]);

  const fetchProfileAndFavorites = async () => {
    try {
      const profileData = await getCurrentUser();
      const formattedUser = {
        accountId: profileData.accountId,
        fullName: profileData.fullName || profileData.username || "Chưa có",
        username: profileData.username || "Chưa có",
        email: profileData.email || "Chưa có",
        phone: profileData.phone ?? "Chưa có",
        address: profileData.address ?? "Chưa có",
        bio: profileData.bio ?? "Chưa có mô tả cá nhân",
        avatar:
          profileData.avatar ||
          "https://res.cloudinary.com/dduv5y00x/image/upload/v1725091761/image_default_profile.jpg",
        travelPreferences: {
          style: profileData.travelStyles?.join(", ") || "Chưa có",
          budget: profileData.budget || "Chưa có",
          favoriteDestinations: profileData.favoriteDestinations || [],
          activities: profileData.interests || [],
          companions: profileData.companions || []
        },
        status: profileData.status || "",
        createdAt: profileData.createdAt || "",
        updatedAt: profileData.updatedAt || ""
      };

      setUser(formattedUser);
      const favoritesData = await getFavorites();
      setFavorites(favoritesData);
    } catch (e) {
      console.error("Lỗi khi tải dữ liệu:", e.message);
    }
  };

  useEffect(() => {
    fetchProfileAndFavorites();
  }, []);

  // Lưu tab hiện tại
  useEffect(() => {
    localStorage.setItem("profileTab", tab);
  }, [tab]);

  const handleOpenModal = (place) => {
    setSelectedPlace(place);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPlace(null);
  };

  const handleRoute = (placeName) => {
    navigate("/user", { state: { destination: placeName } });
    handleCloseModal();
  };

      const DEFAULT_COMMENTS = {
      1: [ 
        { user: "Minh", text: "Bún ngon, nước chấm đậm đà!", rating: 5, sentiment: "positive", time: "2025-08-20T10:15:00Z" },
        { user: "Lan", text: "Không gian sạch sẽ, phục vụ tốt.", rating: 4, sentiment: "positive", time: "2025-08-21T14:30:00Z" },
        { user: "Tuấn", text: "Giá hơi cao nhưng chất lượng xứng đáng.", rating: 3, sentiment: "neutral", time: "2025-08-22T09:00:00Z" },
        { user: "Hương", text: "Món ăn trình bày đẹp mắt, sẽ quay lại!", rating: 5, sentiment: "positive", time: "2025-08-23T11:45:00Z" },
        { user: "Nam", text: "Chỗ ngồi hơi chật nhưng đồ ăn ổn.", rating: 3, sentiment: "neutral", time: "2025-08-24T18:20:00Z" },
        { user: "Lâm", text: "Phục vụ chậm, phải đợi 20 phút.", rating: 2, sentiment: "negative", time: "2025-08-25T12:00:00Z" }
      ],
      2: [ 
        { user: "Huy", text: "Phòng chiếu rộng, âm thanh tốt.", rating: 5, sentiment: "positive", time: "2025-08-22T09:00:00Z" },
        { user: "Mai", text: "Có nhiều suất chiếu, giá hợp lý.", rating: 4, sentiment: "positive", time: "2025-08-23T13:10:00Z" },
        { user: "Dũng", text: "Ghế ngồi thoải mái, nhân viên thân thiện.", rating: 5, sentiment: "positive", time: "2025-08-24T16:45:00Z" },
        { user: "Thảo", text: "Đặt vé online hơi rắc rối.", rating: 3, sentiment: "neutral", time: "2025-08-25T17:30:00Z" }
      ],
      3: [ 
        { user: "Thảo", text: "Đầy đủ hàng hóa, giá tốt.", rating: 4, sentiment: "positive", time: "2025-08-21T08:30:00Z" },
        { user: "Long", text: "Mở cửa 24/7, rất tiện lợi.", rating: 5, sentiment: "positive", time: "2025-08-22T20:00:00Z" },
        { user: "Hải", text: "Nhân viên không nhiệt tình lắm.", rating: 2, sentiment: "negative", time: "2025-08-23T19:00:00Z" }
      ],
      4: [ 
        { user: "Vy", text: "Cảnh quan đẹp, nhiều cây xanh.", rating: 5, sentiment: "positive", time: "2025-08-20T07:15:00Z" },
        { user: "Quân", text: "Thích hợp đi dạo buổi chiều.", rating: 4, sentiment: "positive", time: "2025-08-21T17:40:00Z" },
        { user: "Linh", text: "Có khu vui chơi cho trẻ em.", rating: 5, sentiment: "positive", time: "2025-08-22T10:00:00Z" },
        { user: "Tùng", text: "Thiếu nhà vệ sinh công cộng.", rating: 2, sentiment: "negative", time: "2025-08-23T15:00:00Z" }
      ],
      5: [
        { user: "Phúc", text: "Phòng sạch sẽ, dịch vụ chuyên nghiệp.", rating: 5, sentiment: "positive", time: "2025-08-23T14:00:00Z" },
        { user: "Trang", text: "View đẹp, gần trung tâm.", rating: 4, sentiment: "positive", time: "2025-08-24T09:30:00Z" },
        { user: "Đạt", text: "Giá hơi cao so với tiện nghi.", rating: 3, sentiment: "neutral", time: "2025-08-25T11:20:00Z" }
      ],
      6: [
        { user: "Khoa", text: "Sân mới, mặt cỏ đẹp.", rating: 5, sentiment: "positive", time: "2025-08-20T19:00:00Z" },
        { user: "Bảo", text: "Có đèn chiếu sáng ban đêm.", rating: 4, sentiment: "positive", time: "2025-08-21T20:15:00Z" },
        { user: "Lộc", text: "Không có chỗ gửi xe.", rating: 2, sentiment: "negative", time: "2025-08-22T18:00:00Z" }
      ],
      7: [ 
        { user: "Hạnh", text: "Giáo viên nhiệt tình, chương trình học tốt.", rating: 5, sentiment: "positive", time: "2025-08-22T08:00:00Z" },
        { user: "Tâm", text: "Con mình tiến bộ rõ rệt sau 2 tháng.", rating: 5, sentiment: "positive", time: "2025-08-23T10:30:00Z" },
        { user: "Duyên", text: "Lớp học hơi đông.", rating: 3, sentiment: "neutral", time: "2025-08-24T09:00:00Z" }
      ],}
  const getAverageRating = (placeId) => {
    const comments = DEFAULT_COMMENTS[placeId] || [];
    return comments.length
      ? (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.length).toFixed(1)
      : "—";
  };

  const handleRemoveFavorite = (index) => {
    const updated = favorites.filter((_, i) => i !== index);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const handleRemoveHistory = (index) => {
    const updated = history.filter((_, i) => i !== index);
    setHistory(updated);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const handleSaveSettings = () => {
    const updated = { notificationsEnabled, gpsEnabled, language };
    localStorage.setItem("settings", JSON.stringify(updated));
    alert("Cập nhật cài đặt thành công!");
  };

  // **BẮT ĐẦU THAY ĐỔI**
  const handleSaveUser = async () => {
    try {
      // 1. Cập nhật ảnh đại diện nếu có
      if (tempUser?.avatarFile) {
        await updateAvatar(user.accountId, tempUser.avatarFile);
      }

      // 2. Cập nhật thông tin người dùng
      const { avatarFile, ...profileData } = tempUser;
      await updateUserProfile(user.accountId, profileData);

      // 3. Tải lại dữ liệu mới nhất
      await fetchProfileAndFavorites();
      
      // 4. Reset trạng thái
      setIsEditing(false);
      setPreviewAvatar(null);
      alert("Cập nhật hồ sơ thành công!");
    } catch (e) {
      console.error("Lỗi cập nhật hồ sơ:", e.message);
      alert("Cập nhật hồ sơ thất bại: " + (e.response?.data?.message || e.message));
    }
  };
  // **KẾT THÚC THAY ĐỔI**

  const handleEdit = () => {
    setTempUser(user);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTempUser(null);
    setPreviewAvatar(null); // Hủy cả ảnh xem trước
  };

  const renderTabContent = () => {
    switch (tab) {
      case 0:
        return (
          <ProfileInfo
            user={user}
            isEditing={isEditing}
            tempUser={tempUser}
            previewAvatar={previewAvatar}
            setTempUser={setTempUser}
            handleEdit={handleEdit}
            handleCancelEdit={handleCancelEdit}
            handleSaveUser={handleSaveUser}
            setPreviewAvatar={setPreviewAvatar}
          />
        );
      case 1:
        return (
          <FavoritesTab
            favorites={favorites}
            userLocation={userLocation}
            handleRemoveFavorite={handleRemoveFavorite}
            getAverageRating={getAverageRating}
            handleOpenModal={handleOpenModal}
            selectedPlace={selectedPlace}
            openModal={openModal}
            handleCloseModal={handleCloseModal}
            defaultComments={DEFAULT_COMMENTS}
            handleRoute={handleRoute}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <HistoryTab
            history={history}
            handleRemoveHistory={handleRemoveHistory}
            handleClearAllHistory={handleClearAllHistory}
            handleRoute={handleRoute}
          />
        );
      case 3:
        return (
          <SettingsTab
            notificationsEnabled={notificationsEnabled}
            setNotificationsEnabled={setNotificationsEnabled}
            gpsEnabled={gpsEnabled}
            setGpsEnabled={setGpsEnabled}
            language={language}
            setLanguage={setLanguage}
            handleSaveSettings={handleSaveSettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: '#f8f9fa' }}>
      <Tabs
        orientation="vertical"
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        sx={{
          borderRight: 1,
          borderColor: "divider",
          minWidth: 250,
          background: "#fff",
          alignItems: 'flex-start',
        }}
      >
        <Tab label="Thông tin" sx={{ alignItems: 'flex-start', left: '20px' }} />
        <Tab label="Yêu thích" sx={{ alignItems: 'flex-start', left: '20px' }} />
        <Tab label="Lịch sử" sx={{ alignItems: 'flex-start', left: '20px' }} />
        <Tab label="Cài đặt" sx={{ alignItems: 'flex-start', left: '20px' }} />
        <Button
          variant="outlined"
          sx={{ position: "absolute", bottom: 13, left: 14, textTransform: 'none' }}
          onClick={() => navigate("/user/dashboard")}
        >
          ← Quay lại trang chính
        </Button>
      </Tabs>

      <Box sx={{ flex: 1, height: "100%", overflowY: "auto", p: 3 }}>
        {!user ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          renderTabContent()
        )}
      </Box>
    </Box>
  );
};

export default Profile;