// src/page-user/UseComponent/ProfileInfo.jsx
import React from 'react';
import './ProfileInfo.css'; // Import file CSS mới

// Helper component
const DetailRow = ({ label, value, placeholder = "Chưa có" }) => (
    <div className="detail-row">
        <span className="detail-label">{label}</span>
        {value ? (
            <span className="detail-value">{value}</span>
        ) : (
            <span className="detail-value detail-value-placeholder">{placeholder}</span>
        )}
    </div>
);

const ProfileInfo = ({
  user,
  isEditing,
  tempUser,
  previewAvatar,
  setTempUser,
  handleEdit,
  handleCancelEdit,
  handleSaveUser,
  setPreviewAvatar
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(file);
      setTempUser({ ...tempUser, avatarFile: file });
    }
  };

  return (
    <div className="account-detail-card">
      <header className="account-detail-header">
        <div className="avatar-container">
          <img
            src={previewAvatar || user?.avatar}
            alt={user?.username}
            className="account-detail-avatar"
          />
          {isEditing && (
            <label htmlFor="avatar-upload" className="change-avatar-btn">
              ✏️
              <input id="avatar-upload" type="file" hidden onChange={handleFileChange} accept="image/*"/>
            </label>
          )}
        </div>
        <div className="account-detail-info">
          <h1 className="account-detail-name">{user?.username}</h1>
          <p className="account-detail-email">{user?.email}</p>
        </div>
      </header>

      <main className="account-detail-body">
        {isEditing ? (
          // --- Chế độ CHỈNH SỬA ---
          <>
            <div className="info-column">
              <h3 className="column-title">Thông tin cá nhân</h3>
              <div className="edit-form-grid">
                  <div className="form-group">
                      <label>Họ và tên</label>
                      <input value={tempUser?.fullName || ""} onChange={(e) => setTempUser({ ...tempUser, fullName: e.target.value })}/>
                  </div>
                  <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={tempUser?.email || ""} onChange={(e) => setTempUser({ ...tempUser, email: e.target.value })}/>
                  </div>
                  <div className="form-group">
                      <label>Số điện thoại</label>
                      <input value={tempUser?.phone || ""} onChange={(e) => setTempUser({ ...tempUser, phone: e.target.value })}/>
                  </div>
                  <div className="form-group">
                      <label>Địa chỉ</label>
                      <input value={tempUser?.address || ""} onChange={(e) => setTempUser({ ...tempUser, address: e.target.value })}/>
                  </div>
                  <div className="form-group">
                      <label>Giới thiệu</label>
                      <textarea rows="3" value={tempUser?.bio || ""} onChange={(e) => setTempUser({ ...tempUser, bio: e.target.value })}/>
                  </div>
              </div>
            </div>
            <div className="info-column">
              <h3 className="column-title">Sở thích du lịch</h3>
               <div className="edit-form-grid">
                  <div className="form-group">
                      <label>Phong cách</label>
                      <input value={tempUser?.travelPreferences?.style || ""} onChange={(e) => setTempUser({...tempUser, travelPreferences: { ...tempUser.travelPreferences, style: e.target.value }})}/>
                  </div>
                   <div className="form-group">
                      <label>Địa điểm yêu thích (cách nhau bởi dấu phẩy)</label>
                      <input value={tempUser?.travelPreferences?.favoriteDestinations?.join(', ') || ""} onChange={(e) => setTempUser({...tempUser, travelPreferences: { ...tempUser.travelPreferences, favoriteDestinations: e.target.value.split(',').map(s => s.trim()) }})}/>
                  </div>
                   <div className="form-group">
                      <label>Hoạt động yêu thích (cách nhau bởi dấu phẩy)</label>
                      <input value={tempUser?.travelPreferences?.activities?.join(', ') || ""} onChange={(e) => setTempUser({...tempUser, travelPreferences: { ...tempUser.travelPreferences, activities: e.target.value.split(',').map(s => s.trim()) }})}/>
                  </div>
              </div>
            </div>
          </>
        ) : (
          // --- Chế độ XEM ---
          <>
            <div className="info-column">
              <h3 className="column-title">Thông tin cá nhân</h3>
              <DetailRow label="Họ và tên" value={user?.fullName} />
              <DetailRow label="Email" value={user?.email} />
              <DetailRow label="Số điện thoại" value={user?.phone} />
              <DetailRow label="Địa chỉ" value={user?.address} />
              <DetailRow label="Giới thiệu" value={user?.bio} />
            </div>
            <div className="info-column">
              <h3 className="column-title">Sở thích du lịch</h3>
              <DetailRow label="Phong cách" value={user?.travelPreferences?.style} />
              <DetailRow label="Địa điểm yêu thích" value={user?.travelPreferences?.favoriteDestinations?.join(', ')} placeholder="Không có"/>
              <DetailRow label="Hoạt động" value={user?.travelPreferences?.activities?.join(', ')} placeholder="Không có"/>
            </div>
          </>
        )}
      </main>

      <footer className="card-footer">
        {isEditing ? (
          <>
            <button onClick={handleCancelEdit} className="action-button btn-secondary">Hủy</button>
            <button onClick={handleSaveUser} className="action-button btn-primary">Lưu thay đổi</button>
          </>
        ) : (
          <button onClick={handleEdit} className="action-button btn-primary">Chỉnh sửa thông tin</button>
        )}
      </footer>
    </div>
  );
};

export default ProfileInfo;