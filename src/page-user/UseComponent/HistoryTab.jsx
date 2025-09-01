import React from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearAllIcon from "@mui/icons-material/ClearAll";

const HistoryTab = ({ history, handleRemoveHistory, handleClearAllHistory, handleRoute }) => {
  return (
    <Box>
      <Typography variant="h6">🕒 Lịch sử tìm kiếm</Typography>
      {history.length > 0 && (
        <Button
          variant="outlined"
          color="error"
          startIcon={<ClearAllIcon />}
          sx={{ mt: 2 }}
          onClick={handleClearAllHistory}
        >
          Xóa toàn bộ lịch sử
        </Button>
      )}
      {history.length > 0 ? (
        <List>
          {history.map((place, idx) => (
            <ListItem
              key={idx}
              secondaryAction={
                <IconButton onClick={() => handleRemoveHistory(idx)}>
                  <DeleteIcon />
                </IconButton>
              }
              onClick={() => handleRoute(place.name)}
              sx={{ cursor: 'pointer' }} 
            >
              <ListItemText
                primary={`${place.name}`}
                secondary={
                  <>
                    <span>{place.address}</span>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>Bạn chưa có lịch sử tìm kiếm.</Typography>
      )}
    </Box>
  );
};

export default HistoryTab;