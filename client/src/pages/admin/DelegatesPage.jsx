import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Button,
  IconButton,
  CircularProgress,
  Tooltip,
  Avatar,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  SportsSoccer as MatchIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as AssignedIcon,
  Warning as PendingIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../../hooks/admin";
import { useState } from "react";
import UserModal from "../../components/ui/UserModal";

const DelegatesPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const { data, isLoading, refetch } = useUsers({
    page: page + 1,
    limit: rowsPerPage,
    search,
  });
  const delegates = data?.data?.filter((user) => user.role === "delegate");
  console.log("Delegates:", delegates);

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#1a1a1d",
      borderRadius: "12px",
      "& fieldset": { borderColor: "#242428" },
      "&:hover fieldset": { borderColor: "#3f3f46" },
      "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
    },
    "& .MuiInputBase-input": { color: "#fff", fontSize: "14px" },
  };

  const handleOpenModal = (delegate = null) => {
    if (delegate) {
      setEditingUser({
        ...delegate,
        delegate: delegate,
      });
    } else {
      setEditingUser(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingUser) {
        await updateUser.mutateAsync({ id: editingUser.id, data: formData });
      } else {
        await createUser.mutateAsync({ ...formData, role: "delegate" });
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving delegate:", error);
    }
  };

  const handleDelete = async (delegate) => {
    if (window.confirm("Are you sure you want to delete this delegate?")) {
      await deleteUser.mutateAsync(delegate.userId);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{ fontSize: "28px", fontWeight: 700, color: "#fff", mb: 0.5 }}
          >
            Delegates
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
            Manage registered delegates and their profiles
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Tooltip title='Refresh'>
            <IconButton
              onClick={() => refetch()}
              sx={{
                bgcolor: "#1a1a1d",
                border: "1px solid #242428",
                borderRadius: "12px",
                color: "#9ca3af",
                "&:hover": { bgcolor: "#242428", color: "#fff" },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: "12px",
              bgcolor: "#8b5cf6",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 500,
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            New Delegate
          </Button>
        </Box>
      </Box>
      {/* Filters */}
      <Box
        sx={{
          p: 2,
          mb: 3,
          bgcolor: "#121214",
          border: "1px solid #242428",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <TextField
          placeholder='Search delegates...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon sx={{ color: "#6b7280" }} />
              </InputAdornment>
            ),
          }}
          sx={{ ...inputStyles, flex: 1, maxWidth: 400 }}
        />
      </Box>

      <Box
        sx={{
          bgcolor: "#121214",
          border: "1px solid #242428",
          borderRadius: "16px",
          p: 1,
          overflow: "hidden",
        }}
      >
        {delegates?.map((delegate) => (
          <Box
            key={delegate.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderBottom: "1px solid #242428",
              "&:last-child": { borderBottom: "none" },
              "&:hover": { bgcolor: "#1a1a1d" },
            }}
          >
            {delegate.firstName} {delegate.lastName}
          </Box>
        ))}
      </Box>

      {/* Table */}
      {/* <Box
        sx={{
          bgcolor: "#121214",
          border: "1px solid #242428",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
            }}
          >
            <CircularProgress sx={{ color: "#8b5cf6" }} />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#0a0a0b" }}>
                    <TableCell
                      sx={{
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        borderColor: "#242428",
                      }}
                    >
                      Delegate
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        borderColor: "#242428",
                      }}
                    >
                      Email
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        borderColor: "#242428",
                      }}
                    >
                      Phone number
                    </TableCell>
                    <TableCell
                      align='right'
                      sx={{
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        borderColor: "#242428",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {delegates.map((delegate) => (
                    <TableRow
                      key={delegate.id}
                      sx={{
                        "&:hover": { bgcolor: "#1a1a1d" },
                        "& td": { borderColor: "#242428" },
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: "#3b82f626",
                              color: "#3b82f6",
                              fontSize: "14px",
                              fontWeight: 600,
                            }}
                          >
                            {delegate?.firstName?.[0]}
                            {delegate?.lastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography
                              sx={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#fff",
                              }}
                            >
                              {delegate?.firstName} {delegate?.lastName}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell align='right'>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            sx={{ fontSize: "14px", color: "#9ca3af" }}
                          >
                            {delegate?.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align='right'>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            sx={{ fontSize: "14px", color: "#9ca3af" }}
                          >
                            {delegate?.phone}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell align='right'>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 0.5,
                          }}
                        >
                          <Tooltip title='Edit'>
                            <IconButton
                              onClick={() => handleOpenModal(delegate)}
                              sx={{
                                color: "#6b7280",
                                "&:hover": {
                                  bgcolor: "#242428",
                                  color: "#8b5cf6",
                                },
                              }}
                            >
                              <EditIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Delete'>
                            <IconButton
                              onClick={() => handleDelete(delegate)}
                              sx={{
                                color: "#6b7280",
                                "&:hover": {
                                  bgcolor: "#242428",
                                  color: "#ef4444",
                                },
                              }}
                            >
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {delegates.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        sx={{
                          textAlign: "center",
                          py: 8,
                          borderColor: "#242428",
                        }}
                      >
                        <Typography sx={{ color: "#6b7280" }}>
                          No delegates found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component='div'
              count={delegates?.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                borderTop: "1px solid #242428",
                color: "#6b7280",
                "& .MuiTablePagination-selectIcon": { color: "#6b7280" },
                "& .MuiIconButton-root": { color: "#6b7280" },
                "& .Mui-disabled": { color: "#3f3f46 !important" },
              }}
            />
          </>
        )}
      </Box> */}
      {/* User Modal */}
      <UserModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={createUser.isPending || updateUser.isPending}
        editUser={editingUser}
        allowedRoles={["delegate"]}
      />
    </Box>
  );
};

export default DelegatesPage;
