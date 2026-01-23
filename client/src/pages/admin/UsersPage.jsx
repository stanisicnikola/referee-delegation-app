import { useState } from "react";
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
  Avatar,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  VerifiedUser as AdminIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  useUsers,
  useUserStatistics,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../../hooks/admin";
import UserModal from "../../components/user/UserModal";
import UserStatusBadge from "../../components/user/UserStatusBadge";
import { ConfirmDialog, LoadingSpinner, Modal } from "../../components/ui";

const UsersPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const { data, isLoading, refetch, isFetching } = useUsers({
    page: page + 1,
    limit: rowsPerPage,
    search,
    role: roleFilter !== "all" ? roleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { data: statisticsData } = useUserStatistics();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const users = data?.data || [];
  const stats = statisticsData?.data || {};
  const totalUsers = stats.total ?? data?.pagination?.total ?? 0;
  const roleStats = stats.byRole || {};

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
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
        await createUser.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleOpenDialog = (user) => {
    setUserToDelete(user);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDelete = async () => {
    await deleteUser.mutateAsync(userToDelete.id);
    handleCloseConfirmDialog();
  };

  const getRoleBadge = (role) => {
    const config = {
      admin: {
        label: "Admin",
        color: "#8b5cf6",
        bg: "rgba(139, 92, 246, 0.15)",
        icon: AdminIcon,
      },
      delegate: {
        label: "Delegate",
        color: "#3b82f6",
        bg: "#3b82f626",
        icon: GroupsIcon,
      },
      referee: {
        label: "Referee",
        color: "#22c55e",
        bg: "rgba(34, 197, 94, 0.15)",
        icon: PersonIcon,
      },
    };
    const { label, color, bg, icon: Icon } = config[role] || config.referee;
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          px: 1.5,
          py: 0.5,
          borderRadius: "10px",
          bgcolor: bg,
          border: `1px solid ${color}30`,
        }}
      >
        <Icon sx={{ fontSize: 14, color }} />
        <Typography sx={{ fontSize: "12px", fontWeight: 500, color }}>
          {label}
        </Typography>
      </Box>
    );
  };

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
            Users Management
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
            Manage system users, referees, and administrators
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
              textTransform: "none",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            New User
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2,
          mb: 3,
        }}
      >
        {[
          {
            label: "Total Users",
            value: totalUsers,
            icon: PersonIcon,
            color: "#f59e0b",
          },
          {
            label: "Referees",
            value: roleStats.referees,
            icon: PersonIcon,
            color: "#22c55e",
          },
          {
            label: "Delegates",
            value: roleStats.delegates,
            icon: GroupsIcon,
            color: "#3b82f6",
          },
          {
            label: "Admins",
            value: roleStats.admins,
            icon: AdminIcon,
            color: "#8b5cf6",
          },
        ].map((stat) => (
          <Box
            key={stat.label}
            sx={{
              p: 2.5,
              bgcolor: "#121214",
              border: "1px solid #242428",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                bgcolor: `${stat.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <stat.icon sx={{ fontSize: 24, color: stat.color }} />
            </Box>
            <Box>
              <Typography
                sx={{ fontSize: "24px", fontWeight: 700, color: "#fff" }}
              >
                {stat.value}
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
                {stat.label}
              </Typography>
            </Box>
          </Box>
        ))}
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
          placeholder='Search users...'
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

        <FormControl sx={{ minWidth: 150, ...inputStyles }}>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            displayEmpty
            sx={{
              "& .MuiSelect-select": {
                color: roleFilter === "all" ? "#6b7280" : "#fff",
              },
            }}
          >
            <MenuItem value='all'>All Roles</MenuItem>
            <MenuItem value='admin'>Admin</MenuItem>
            <MenuItem value='delegate'>Delegate</MenuItem>
            <MenuItem value='referee'>Referee</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150, ...inputStyles }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            sx={{
              "& .MuiSelect-select": {
                color: statusFilter === "all" ? "#6b7280" : "#fff",
              },
            }}
          >
            <MenuItem value='all'>All Status</MenuItem>
            <MenuItem value='active'>Active</MenuItem>
            <MenuItem value='inactive'>Inactive</MenuItem>
            <MenuItem value='suspended'>Suspended</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Box
        sx={{
          bgcolor: "#121214",
          border: "1px solid #242428",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {isLoading || isFetching ? (
          <LoadingSpinner />
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
                      User
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
                      Role
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
                      Status
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
                      Created
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
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
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
                              bgcolor: "#8b5cf620",
                              color: "#8b5cf6",
                              fontSize: "14px",
                              fontWeight: 600,
                            }}
                          >
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography
                              sx={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#fff",
                              }}
                            >
                              {user.firstName} {user.lastName}
                            </Typography>
                            {user.referee?.licenseNumber && (
                              <Typography
                                sx={{ fontSize: "12px", color: "#6b7280" }}
                              >
                                {user.referee.licenseNumber}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <UserStatusBadge status={user.status} />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
                          {new Date(user.created_at).toLocaleDateString(
                            "en-US",
                          )}
                        </Typography>
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
                              onClick={() => handleOpenModal(user)}
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
                              onClick={() => handleOpenDialog(user)}
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
                  {users.length === 0 && (
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
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component='div'
              count={totalUsers}
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
      </Box>

      {/* User Modal */}
      <UserModal
        open={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleSubmit}
        isLoading={createUser.isPending || updateUser.isPending}
        editUser={editingUser}
      />
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleDelete}
        title='Delete User'
        message='Are you sure you want to delete this user?'
        confirmText='Delete'
        loading={deleteUser.isPending}
      />
    </Box>
  );
};

export default UsersPage;
