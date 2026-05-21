import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  CircularProgress,
} from "@mui/material";
import RefereeDetailsModal from "../../components/delegate/RefereeDetailsModal";
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  useReferees,
  useRefereesStatistics,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../../hooks";
import { ConfirmDialog, FilterSearch } from "../../components/ui";
import UserModal from "../../components/user/UserModal";
import StatusBadge from "../../components/user/StatusBadge";

const RefereesPage = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [detailsReferee, setDetailsReferee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [refereeToDelete, setRefereeToDelete] = useState(null);

  const { data: refereesData, isLoading } = useReferees({ limit: 100 });
  const { data: statisticsData } = useRefereesStatistics();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const referees = refereesData?.data || [];
  const stats = statisticsData?.data || {};

  // Filter referees
  const filteredReferees = referees.filter((referee) => {
    const fullName =
      `${referee.user?.firstName} ${referee.user?.lastName}`.toLowerCase();
    const matchesSearch =
      search === "" || fullName.includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || referee.licenseCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getAvatarColor = (index) => {
    const colors = [
      "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
      "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
      "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
      "linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)",
    ];
    return colors[index % colors.length];
  };

  const handleOpenDetails = (referee) => {
    setDetailsReferee(referee);
  };

  const handleCloseDetails = () => {
    setDetailsReferee(null);
  };

  const handleOpenModal = (referee = null) => {
    setEditingUser(referee ? { ...referee.user, referee } : null);
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

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(refereeToDelete.userId);
    } catch (error) {
      console.error("Error deleting referee:", error);
    } finally {
      setRefereeToDelete(null);
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#121214",
      borderRadius: "12px",
      "& fieldset": { borderColor: "#242428" },
      "&:hover fieldset": { borderColor: "#3f3f46" },
      "&.Mui-focused fieldset": { borderColor: "#f97316" },
    },
    "& .MuiInputBase-input": { color: "#fff", fontSize: "14px" },
  };

  // Stats
  const totalReferees = stats.total ?? refereesData?.pagination?.total ?? 0;
  const availableCount =
    stats.availabilityToday?.available ??
    referees.filter((referee) => referee.user?.status === "active").length;
  const unavailableCount =
    stats.availabilityToday?.unavailable ??
    Math.max(0, totalReferees - availableCount);
  const detailsIndex = detailsReferee
    ? Math.max(
        0,
        referees.findIndex((r) => r.id === detailsReferee.id),
      )
    : 0;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: { xs: "34px", sm: "40px", md: "48px" },
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.05,
              }}
            >
              Referees
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              View and manage referee profiles and status
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: { xs: "100%", lg: "auto" },
              flexWrap: "wrap",
            }}
          >
            {/* Stats */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                px: 3,
                py: 1.5,
                bgcolor: "#121214",
                borderRadius: "12px",
                border: "1px solid #242428",
                width: { xs: "100%", sm: "auto" },
                justifyContent: { xs: "space-around", sm: "flex-start" },
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}
                >
                  {totalReferees}
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                  Total
                </Typography>
              </Box>
              <Box
                sx={{
                  width: "1px",
                  height: 32,
                  bgcolor: "#242428",
                  flexShrink: 0,
                }}
              />
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{ fontSize: "20px", fontWeight: 700, color: "#22c55e" }}
                >
                  {availableCount}
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                  Available today
                </Typography>
              </Box>
              <Box
                sx={{
                  width: "1px",
                  height: 32,
                  bgcolor: "#242428",
                  flexShrink: 0,
                }}
              />
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{ fontSize: "20px", fontWeight: 700, color: "#ef4444" }}
                >
                  {unavailableCount}
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                  Unavailable today
                </Typography>
              </Box>
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{
                width: { xs: "100%", sm: "auto" },
                px: 2.5,
                py: 1.25,
                borderRadius: "12px",
                bgcolor: "#f97316",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { bgcolor: "#ea580c" },
              }}
            >
              New referee
            </Button>
          </Box>
        </Box>
      </Box>

      <Box>
        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: { xs: 3, md: 4 },
            flexDirection: { xs: "column", md: "row" },
            alignItems: { md: "center" },
          }}
        >
          <FilterSearch
            variant='delegate'
            placeholder='Search by name...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              ...inputStyles,
              width: "100%",
              maxWidth: { xs: "100%", md: 400 },
            }}
          />
          <Box
            sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              pb: 0.5,
              width: "100%",
              WebkitOverflowScrolling: "touch",
              "&::-webkit-scrollbar": { height: 6 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "#2e2e33",
                borderRadius: "9999px",
              },
            }}
          >
            {[
              { value: "all", label: "All categories" },
              { value: "international", label: "International" },
              { value: "A", label: "Category A" },
              { value: "B", label: "Category B" },
              { value: "C", label: "Category C" },
              { value: "regional", label: "Regional" },
            ].map((category) => (
              <Button
                key={category.value}
                onClick={() => setCategoryFilter(category.value)}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: "10px",
                  bgcolor:
                    categoryFilter === category.value ? "#f97316" : "#121214",
                  border: "1px solid",
                  borderColor:
                    categoryFilter === category.value ? "#f97316" : "#242428",
                  color: categoryFilter === category.value ? "#fff" : "#9ca3af",
                  fontSize: "14px",
                  fontWeight: 500,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  "&:hover": {
                    bgcolor:
                      categoryFilter === category.value ? "#ea580c" : "#1a1a1d",
                  },
                }}
              >
                {category.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Referees Grid */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#f97316" }} />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, 1fr)",
              },
              gap: { xs: 2, md: 3 },
            }}
          >
            {filteredReferees.map((referee, index) => {
              return (
                <Box
                  key={referee.id}
                  sx={{
                    bgcolor: "#121214",
                    borderRadius: "16px",
                    border: "1px solid #242428",
                    overflow: "hidden",
                    minWidth: 0,
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: "#3f3f46",
                    },
                  }}
                >
                  {/* Card Header */}
                  <Box
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      borderBottom: "1px solid #242428",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                      minWidth: 0,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: { xs: 48, sm: 56 },
                        height: { xs: 48, sm: 56 },
                        background: getAvatarColor(index),
                        fontSize: "18px",
                        fontWeight: 700,
                      }}
                    >
                      {referee.user?.firstName?.[0]}
                      {referee.user?.lastName?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#fff",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {referee.user?.firstName} {referee.user?.lastName}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 0.5,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          icon={
                            <StarIcon sx={{ fontSize: "14px !important" }} />
                          }
                          label={`Cat. ${referee.licenseCategory || "N/A"}`}
                          size='small'
                          sx={{
                            bgcolor: "rgba(249, 115, 22, 0.1)",
                            color: "#f97316",
                            border: "1px solid rgba(249, 115, 22, 0.3)",
                            fontWeight: 500,
                            fontSize: "12px",
                            height: 24,
                            "& .MuiChip-icon": { color: "#f97316" },
                          }}
                        />
                        <StatusBadge status={referee.user?.status} />
                      </Box>
                    </Box>
                  </Box>

                  {/* Card Body */}
                  <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          color: "#9ca3af",
                        }}
                      >
                        <LocationIcon sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontSize: "14px" }}>
                          {referee.city || "N/A"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          color: "#9ca3af",
                        }}
                      >
                        <PhoneIcon sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontSize: "14px" }}>
                          {referee.phone || referee.user?.phone || "N/A"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          color: "#9ca3af",
                          minWidth: 0,
                        }}
                      >
                        <EmailIcon sx={{ fontSize: 16 }} />
                        <Typography
                          sx={{
                            fontSize: "14px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {referee.user?.email || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: "1px solid #242428",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        size='small'
                        onClick={() => handleOpenDetails(referee)}
                        sx={{
                          color: "#f97316",
                          textTransform: "none",
                          fontWeight: 600,
                          bgcolor: "#1a1a1d",
                          "&:hover": { bgcolor: "rgba(249, 115, 22, 0.08)" },
                        }}
                      >
                        View details
                      </Button>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                          size='small'
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenModal(referee)}
                          sx={{
                            color: "#9ca3af",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": { bgcolor: "#242428", color: "#fff" },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size='small'
                          startIcon={<DeleteIcon />}
                          onClick={() => setRefereeToDelete(referee)}
                          sx={{
                            color: "#ef4444",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": { bgcolor: "rgba(239,68,68,0.1)" },
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <RefereeDetailsModal
        open={Boolean(detailsReferee)}
        referee={detailsReferee}
        onClose={handleCloseDetails}
        avatarColor={getAvatarColor(detailsIndex)}
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
        open={Boolean(refereeToDelete)}
        onClose={() => setRefereeToDelete(null)}
        onConfirm={handleDelete}
        title='Delete Referee'
        message='Are you sure you want to delete this referee?'
        confirmText='Delete'
        confirmColor='error'
        loading={deleteUser.isPending}
      />
    </Box>
  );
};

export default RefereesPage;
