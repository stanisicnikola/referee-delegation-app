import { useState } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import {
  Person as PersonIcon,
  Groups as GroupsIcon,
  VerifiedUser as AdminIcon,
} from "@mui/icons-material";
import {
  useUsers,
  useUserStatistics,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../../hooks/admin";
import UserModal from "../../components/user/UserModal";
import StatusBadge from "../../components/user/StatusBadge";
import RoleBadge from "../../components/user/RoleBadge";
import {
  ConfirmDialog,
  PageHeader,
  StatsGrid,
  EditButton,
  DeleteButton,
  DataTable,
  FilterSearch,
  FilterSelect,
} from "../../components/ui";

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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <PageHeader
        title='Users Management'
        subtitle='Manage system users, referees, and administrators'
        onRefresh={() => refetch()}
        onAdd={() => handleOpenModal()}
        addLabel='New User'
      />

      <StatsGrid
        stats={[
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
        ]}
      />

      {/* Filters */}
      <Box
        sx={{
          p: 2,
          mb: 3,
          bgcolor: "#121214",
          border: "1px solid #242428",
          borderRadius: "16px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
        }}
      >
        <FilterSearch
          placeholder='Search users...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <FilterSelect
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          placeholder='All Roles'
          options={[
            { value: "admin", label: "Admin" },
            { value: "delegate", label: "Delegate" },
            { value: "referee", label: "Referee" },
          ]}
        />

        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder='All Status'
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "suspended", label: "Suspended" },
          ]}
        />
      </Box>

      {/* Table */}
      <DataTable
        columns={[
          {
            id: "user",
            label: "User",
            render: (_, user) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
                    <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                      {user.referee.licenseNumber}
                    </Typography>
                  )}
                </Box>
              </Box>
            ),
          },
          {
            id: "email",
            label: "Email",
            render: (email) => (
              <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                {email}
              </Typography>
            ),
          },
          {
            id: "role",
            label: "Role",
            render: (role) => <RoleBadge role={role} />,
          },
          {
            id: "created_at",
            label: "Created",
            render: (date) => (
              <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
                {new Date(date).toLocaleDateString("en-GB")}
              </Typography>
            ),
          },
          {
            id: "status",
            label: "Status",
            render: (status) => <StatusBadge status={status} />,
          },
          {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (_, user) => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 0.5,
                }}
              >
                <EditButton onClick={() => handleOpenModal(user)} />
                <DeleteButton onClick={() => handleOpenDialog(user)} />
              </Box>
            ),
          },
        ]}
        data={users}
        loading={isLoading || isFetching}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalUsers}
        onPageChange={setPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        emptyMessage='No users found'
      />

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
