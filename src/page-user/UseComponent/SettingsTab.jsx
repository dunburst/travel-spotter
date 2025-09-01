// src/components/profile/SettingsTab.jsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Switch,
  Select,
  MenuItem,
  Divider
} from "@mui/material";

const SettingsTab = ({
  notificationsEnabled,
  setNotificationsEnabled,
  gpsEnabled,
  setGpsEnabled,
  language,
  setLanguage,
  handleSaveSettings
}) => {
  return (
    <Box>
      <Typography variant="h6">⚙️ Cài đặt</Typography>
      <List>
        <ListItem>
          <ListItemText primary="Nhận thông báo gợi ý" />
          <Switch
            checked={notificationsEnabled}
            onChange={() => setNotificationsEnabled(!notificationsEnabled)}
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary="Cho phép GPS" />
          <Switch
            checked={gpsEnabled}
            onChange={() => setGpsEnabled(!gpsEnabled)}
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary="Ngôn ngữ" />
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            size="small"
            sx={{ ml: 2, minWidth: 120 }}
          >
            <MenuItem value="vi">Tiếng Việt</MenuItem>
            <MenuItem value="en">English</MenuItem>
          </Select>
        </ListItem>
      </List>
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleSaveSettings}
      >
        Lưu cài đặt
      </Button>
    </Box>
  );
};

export default SettingsTab;