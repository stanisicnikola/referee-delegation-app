import { Tooltip, IconButton } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

export const EditButton = ({ onClick, tooltip = "Edit", sx = {} }) => {
  return (
    <Tooltip title={tooltip}>
      <IconButton
        onClick={onClick}
        sx={{
          color: "#6b7280",
          "&:hover": {
            bgcolor: "#242428",
            color: "#8b5cf6",
          },
          ...sx,
        }}
      >
        <EditIcon fontSize='small' />
      </IconButton>
    </Tooltip>
  );
};

export const DeleteButton = ({ onClick, tooltip = "Delete", sx = {} }) => {
  return (
    <Tooltip title={tooltip}>
      <IconButton
        onClick={onClick}
        sx={{
          color: "#cf5858",
          "&:hover": {
            bgcolor: "#242428",
            color: "#ef4444",
          },
          ...sx,
        }}
      >
        <DeleteIcon fontSize='small' />
      </IconButton>
    </Tooltip>
  );
};
