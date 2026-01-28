import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Warning as SuspendedIcon,
} from "@mui/icons-material";
import {
  useUsers,
  useCreateUser,
  useUserStatistics,
  useUpdateUser,
  useDeleteUser,
} from "../../hooks/admin";
import { useState } from "react";
import UserModal from "../../components/user/UserModal";
import DelegateCard from "../../components/delegate/DelegateCard";
import { ConfirmDialog, LoadingSpinner } from "../../components/ui";

const DelegatesPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [delegateToDelete, setDelegateToDelete] = useState(null);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const { data, isLoading, isFetching, refetch } = useUsers({
    page: 1,
    limit: 100,
    search,
    status: statusFilter !== "all" ? statusFilter : undefined,
    role: "delegate",
  });
  const { data: statisticsData } = useUserStatistics();
  console.log("User statistics data:", statisticsData);

  const stats = statisticsData?.data || {};
  const totalUsers = stats?.byRole?.delegates || 0;
  const activeDelegates = stats?.activeDelegates || 0;
  const inactiveDelegates = stats?.inactiveDelegates || 0;
  const suspendedDelegates = stats?.suspendedDelegates || 0;
  const delegates = data?.data || [];

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

  const handleOpenDelete = (delegate) => {
    setDelegateToDelete(delegate);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setDelegateToDelete(null);
  };

  const handleDelete = async () => {
    if (!delegateToDelete) return;
    await deleteUser.mutateAsync(delegateToDelete.id);
    handleCloseConfirmDialog();
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
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {[
          {
            label: "Total",
            value: totalUsers,
            icon: PersonIcon,
            color: "#3b82f6",
          },
          {
            label: "Active",
            value: activeDelegates,
            icon: ActiveIcon,
            color: "#22c55e",
          },
          {
            label: "Inactive",
            value: inactiveDelegates,
            icon: InactiveIcon,
            color: "#ef4444",
          },
          {
            label: "Suspended",
            value: suspendedDelegates,
            icon: SuspendedIcon,
            color: "#df5f04",
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
          sx={{ ...inputStyles, flex: 1, maxWidth: 400, minWidth: 150 }}
        />
        <FormControl sx={{ minWidth: 80, ...inputStyles }}>
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        {isLoading || isFetching ? (
          <Box
            sx={{
              gridColumn: "1 / -1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "60vh",
            }}
          >
            <LoadingSpinner />
          </Box>
        ) : (
          <>
            {delegates?.map((delegate) => (
              <DelegateCard
                key={delegate.id}
                delegate={delegate}
                onEdit={handleOpenModal}
                onDelete={handleOpenDelete}
              />
            ))}
            <Box
              onClick={() => handleOpenModal()}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                minHeight: 380,
                borderRadius: "16px",
                border: "2px dashed #2a2a2f",
                bgcolor: "rgba(18, 18, 20, 0.5)",
                color: "#9ca3af",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#8b5cf6",
                  color: "#c4b5fd",
                },
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "12px",
                  bgcolor: "rgba(139, 92, 246, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8b5cf6",
                  fontSize: 32,
                }}
              >
                +
              </Box>
              <Typography sx={{ fontSize: "14px" }}>
                Add new delegate
              </Typography>
            </Box>
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
        allowedRoles={["delegate"]}
      />
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleDelete}
        title='Delete Delegate'
        message='Are you sure you want to delete this delegate?'
        confirmText='Delete'
        loading={deleteUser.isPending}
      />
    </Box>
  );
};

export default DelegatesPage;
