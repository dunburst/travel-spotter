// src/components/profile/FavoritesTab.jsx
import React from 'react';
import {
    Box,
    Typography,
    Card,
    Avatar,
    IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { haversineDistance, toSlug } from "../UserDashboard";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const FavoritesTab = ({
    favorites,
    userLocation,
    handleRemoveFavorite,
    getAverageRating,
    isLoading 
}) => {
    const navigate = useNavigate(); 

    const handleCardClick = (item) => {
        const slug = toSlug(item.name);
        navigate(`/location/${item.id}/${slug}`, { state: { userLocation } });
    };

    return (
        <Box>
            {isLoading ? (
                <Typography>Đang tải danh sách yêu thích...</Typography>
            ) : Array.isArray(favorites) && favorites.length > 0 ? (
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    {favorites.map((item) => (
                        <Card
                            key={item.id}
                            sx={{ p: 2, cursor: "pointer" }}
                            onClick={() => handleCardClick(item)}
                        >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Avatar
                                    src={item.image || "https://via.placeholder.com/80"}
                                    alt={item.name}
                                    sx={{ width: 64, height: 64, mr: 2 }}
                                />
                                <Box>
                                    <Typography variant="h6">{item.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.category}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {item.address || "Chưa có địa chỉ"}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                ⭐ {getAverageRating(item.id)} / 5
                            </Typography>
                            {userLocation && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Khoảng cách: {item.lat && item.lng ? haversineDistance(userLocation.lat, userLocation.lng, item.lat, item.lng).toFixed(1) : "—"} km
                                </Typography>
                            )}
                            {item.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {item.description}
                                </Typography>
                            )}
                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFavorite(item.id);
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Card>
                    ))}
                </Box>
            ) : (
                <Typography>Bạn chưa lưu địa điểm nào.</Typography>
            )}
        </Box>
    );
};

export default FavoritesTab;