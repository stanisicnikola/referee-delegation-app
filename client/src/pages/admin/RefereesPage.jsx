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
import {
  REFEREE_CATEGORY_OPTIONS,
  getRefereeCategoryMeta,
} from "../../constants/refereeCategories";

const RefereesPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [licenseFilter, setLicenseFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [refereeToDelete, setRefereeToDelete] = useState(null);

  const { data, isLoading, refetch, isFetching } = useReferees({
    page: page + 1,
    limit: rowsPerPage,
    search,
    licenseCategory: licenseFilter !== "all" ? licenseFilter : undefined,
  });

  const { data: statisticsData } = useRefereesStatistics();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const referees = data?.data || [];
  const stats = statisticsData?.data || {};
  const totalReferees = stats.total ?? data?.pagination?.total ?? 0;
  const licenseCategoryStats = stats.byLicenseCategory || {};

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
    try {
      await deleteUser.mutateAsync(refereeToDelete.userId);
    } catch (error) {
      console.error("Error deleting referee:", error);
    } finally {
      handleCloseDialog();
    }
  };

  const getCategoryBadge = (category) => {
    const { label, color, bg } = getRefereeCategoryMeta(category);

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
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <PageHeader
        title='Referees'
        subtitle='Manage registered referees and their profiles'
        onRefresh={() => refetch()}
        onAdd={() => handleOpenModal()}
        addLabel='New Referee'
      />

      <StatsGrid
        stats={[
          {
            label: "Total Referees",
            value: totalReferees,
            icon: PersonIcon,
            color: "#8b5cf6",
          },
          {
            label: "Black Category",
            value:
              licenseCategoryStats.black ??
              referees.filter((r) => r.licenseCategory === "black").length,
            icon: StarIcon,
            color: "#f8fafc",
          },
          {
            label: "Green Category",
            value:
              licenseCategoryStats.green ??
              referees.filter((r) => r.licenseCategory === "green").length,
            icon: StarIcon,
            color: "#22c55e",
          },
          {
            label: "White Category",
            value:
              licenseCategoryStats.white ??
              referees.filter((r) => r.licenseCategory === "white").length,
            icon: StarIcon,
            color: "#e5e7eb",
          },
          {
            label: "No License Category",
            value:
              licenseCategoryStats.none ??
              referees.filter((r) => r.licenseCategory === "none").length,
            icon: StarIcon,
            color: "#9ca3af",
          },
        ]}
      />

      <Box
        sx={{
          p: 2,
          mb: 3,
          bgcolor: "#121214",
          border: "1px solid #242428",
          borderRadius: "16px",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: { sm: "wrap" },
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
          value={licenseFilter}
          onChange={(e) => setLicenseFilter(e.target.value)}
          placeholder='All categories'
          options={REFEREE_CATEGORY_OPTIONS}
        />
      </Box>

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
            label: "License Number",
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
            label: "License Category",
            render: (license) => getCategoryBadge(license),
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
