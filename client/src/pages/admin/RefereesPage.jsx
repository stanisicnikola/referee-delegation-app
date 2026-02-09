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
  Star as StarIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  Refresh as RefreshIcon,
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
import { ConfirmDialog, LoadingSpinner } from "../../components/ui";
import { toast } from "react-toastify";

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
            Referees
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
            Manage registered referees and their profiles
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
            New Referee
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
          placeholder='Search referees...'
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            displayEmpty
            sx={{
              "& .MuiSelect-select": {
                color: categoryFilter === "all" ? "#6b7280" : "#fff",
              },
            }}
          >
            <MenuItem value='all'>All Categories</MenuItem>
            <MenuItem value='international'>International</MenuItem>
            <MenuItem value='A'>Category A</MenuItem>
            <MenuItem value='B'>Category B</MenuItem>
            <MenuItem value='C'>Category C</MenuItem>
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
                      Referee
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
                      License
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
                      Category
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
                      City
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
                      Experience
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
                  {referees.map((referee) => (
                    <TableRow
                      key={referee.id}
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
                            <Typography
                              sx={{ fontSize: "12px", color: "#6b7280" }}
                            >
                              {referee.user?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <BadgeIcon sx={{ fontSize: 16, color: "#6b7280" }} />
                          <Typography
                            sx={{
                              fontSize: "14px",
                              color: "#9ca3af",
                              fontFamily: "monospace",
                            }}
                          >
                            {referee.licenseNumber || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {getCategoryBadge(referee.licenseCategory)}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LocationIcon
                            sx={{ fontSize: 16, color: "#6b7280" }}
                          />
                          <Typography
                            sx={{ fontSize: "14px", color: "#9ca3af" }}
                          >
                            {referee.city || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                          {referee.experienceYears
                            ? `${referee.experienceYears} years`
                            : "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={referee.user?.status} />
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
                              onClick={() => handleOpenModal(referee)}
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
                              onClick={() => handleOpenDialog(referee)}
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
                  {referees.length === 0 && (
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
                          No referees found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component='div'
              count={totalReferees}
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
