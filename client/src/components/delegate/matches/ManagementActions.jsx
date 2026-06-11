import { Box } from "@mui/material";
import { DeleteButton, EditButton } from "../../ui";

const ManagementActions = ({ match, onEdit, onDelete }) => (
  <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
    <EditButton
      onClick={(event) => {
        event.stopPropagation();
        onEdit(match);
      }}
    />
    <DeleteButton
      onClick={(event) => {
        event.stopPropagation();
        onDelete(match);
      }}
    />
  </Box>
);

export default ManagementActions;
