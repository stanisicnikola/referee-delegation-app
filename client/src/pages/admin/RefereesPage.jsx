import { useState } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import {
  Person as PersonIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";
import {
  useReferees,
  useRefereesStatistics,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../../hooks/admin";
import UserModal from "../../components/user/UserModal";
import StatusBadge from "../../components/user/StatusBadge";
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

const RefereesPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [refereeToDelete, setRefereeToDelete] = useState(null);

  const { data, isLoading, refetch, isFetching } = useReferees({
    page: page + 1,
    limit: rowsPerPage,
    search,
    licenseCategory: categoryFilter !== "all" ? categoryFilter : undefined,
  });

  const { data: statisticsData } = useRefereesStatistics();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const referees = data?.data || [];
  const stats = statisticsData?.data || {};
  const totalReferees = stats.total ?? data?.pagination?.total ?? 0;
  const categoryStats = stats.byCategory || {};

  const handleOpenModal = (referee = null) => {
    if (referee) {
      setEditingUser({
        ...referee.user,
        referee: referee,
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
        await createUser.mutateAsync({ ...formData, role: "referee" });
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving referee:", error);
    }
  };

  const handleOpenDialog = (referee) => {
    setRefereeToDelete(referee);
    setConfirmDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
    setRefereeToDelete(null);
  };

  const handleDelete = async () => {
    await deleteUser.mutateAsync(refereeToDelete.userId);
    handleCloseDialog();
  };

  const getCategoryBadge = (category) => {
    const config = {
      international: {
        label: "International",
        color: "#f59e0b",
        bg: "rgba(245, 158, 11, 0.15)",
      },
      A: {
        label: "Category A",
        color: "#22c55e",
        bg: "rgba(34, 197, 94, 0.15)",
      },
      B: {
        label: "Category B",
        color: "#3b82f6",
        bg: "#3b82f626",
      },
      C: {
        label: "Category C",
        color: "#8b5cf6",
        bg: "rgba(139, 92, 246, 0.15)",
      },
      regional: {
        label: "Regional",
        color: "#d3f127",
        bg: "rgba(211, 241, 39, 0.15)",
      },
    };
    const { label, color, bg } = config[category] || {
      label: category,
      color: "#6b7280",
      bg: "rgba(107, 114, 128, 0.15)",
    };
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          px: 1.5,
          py: 0.5,
          borderRadius: "10px",
          bgcolor: bg,
          border: `1px solid ${color}30`,
        }}
      >
        <StarIcon sx={{ fontSize: 14, color }} />
        <Typography sx={{ fontSize: "12px", fontWeight: 500, color }}>
          {label}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title='Referees'
        subtitle='Manage registered referees and their profiles'
        onRefresh={() => refetch()}
        onAdd={() => handleOpenModal()}
        addLabel='New User'
      />

      {/* Stats Cards */}
      <StatsGrid
        stats={[
          {
            label: "Total Referees",
            value: totalReferees,
            icon: PersonIcon,
            color: "#8b5cf6",
          },
          {
            label: "International",
            value:
              categoryStats.international ??
              referees.filter((r) => r.licenseCategory === "international")
                .length,
            icon: StarIcon,
            color: "#f59e0b",
          },
          {
            label: "Category A",
            value:
              categoryStats.A ??
              referees.filter((r) => r.licenseCategory === "A").length,
            icon: StarIcon,
            color: "#22c55e",
          },
          {
            label: "Category B",
            value:
              categoryStats.B ??
              referees.filter((r) => r.licenseCategory === "B").length,
            icon: StarIcon,
            color: "#3b82f6",
          },
          {
            label: "Category C",
            value:
              categoryStats.C ??
              referees.filter((r) => r.licenseCategory === "C").length,
            icon: StarIcon,
            color: "#8b5cf6",
          },
          {
            label: "Regional",
            value:
              categoryStats.regional ??
              referees.filter((r) => r.licenseCategory === "regional").length,
            icon: StarIcon,
            color: "#d3f127",
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
          placeholder='Search referees...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <FilterSelect
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          placeholder='All Categories'
          options={[
            { value: "international", label: "International" },
            { value: "A", label: "Category A" },
            { value: "B", label: "Category B" },
            { value: "C", label: "Category C" },
          ]}
        />
      </Box>

      {/* Table */}
      <DataTable
        columns={[
          {
            id: "referee",
            label: "Referee",
            render: (_, referee) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "#22c55e20",
                    color: "#22c55e",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {referee.user?.firstName?.[0]}
                  {referee.user?.lastName?.[0]}
                </Avatar>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#fff",
                    }}
                  >
                    {referee.user?.firstName} {referee.user?.lastName}
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                    {referee.user?.email}
                  </Typography>
                </Box>
              </Box>
            ),
          },
          {
            id: "licenseNumber",
            label: "License",
            render: (license) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BadgeIcon sx={{ fontSize: 16, color: "#6b7280" }} />
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: "#9ca3af",
                    fontFamily: "monospace",
                  }}
                >
                  {license || "N/A"}
                </Typography>
              </Box>
            ),
          },
          {
            id: "licenseCategory",
            label: "Category",
            render: (category) => getCategoryBadge(category),
          },
          {
            id: "city",
            label: "City",
            render: (city) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationIcon sx={{ fontSize: 16, color: "#3b82f6" }} />
                <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                  {city || "N/A"}
                </Typography>
              </Box>
            ),
          },
          {
            id: "experienceYears",
            label: "Experience",
            render: (years) => (
              <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                {years ? `${years} years` : "N/A"}
              </Typography>
            ),
          },
          {
            id: "status",
            label: "Status",
            render: (_, referee) => (
              <StatusBadge status={referee.user?.status} />
            ),
          },
          {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (_, referee) => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 0.5,
                }}
              >
                <EditButton onClick={() => handleOpenModal(referee)} />
                <DeleteButton onClick={() => handleOpenDialog(referee)} />
              </Box>
            ),
          },
        ]}
        data={referees}
        loading={isLoading || isFetching}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalReferees}
        onPageChange={setPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        emptyMessage='No referees found'
      />

      {/* User Modal */}
      <UserModal
        open={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleSubmit}
        isLoading={createUser.isPending || updateUser.isPending}
        editUser={editingUser}
        allowedRoles={["referee"]}
      />
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleDelete}
        title='Delete Referee'
        message='Are you sure you want to delete this referee?'
        confirmText='Delete'
        loading={deleteUser.isPending}
      />
    </Box>
  );
};

export default RefereesPage;
