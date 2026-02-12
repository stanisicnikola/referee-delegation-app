import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import {
  Stadium as VenueIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon,
  People as CapacityIcon,
} from "@mui/icons-material";
import {
  useVenues,
  useCreateVenue,
  useUpdateVenue,
  useDeleteVenue,
} from "../../hooks/admin";
import {
  PageHeader,
  StatsGrid,
  LoadingSpinner,
  EditButton,
  DeleteButton,
  CustomInput,
  FilterSearch,
} from "../../components/ui";

const VenueModal = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  editVenue = null,
}) => {
  const [formData, setFormData] = useState({
    name: editVenue?.name || "",
    address: editVenue?.address || "",
    city: editVenue?.city || "",
    capacity: editVenue?.capacity || "",
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    if (formData.name && formData.city) {
      onSubmit(formData);
    }
  };

  if (!open) return null;

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#1a1a1d",
      borderRadius: "12px",
      "& fieldset": { borderColor: "#242428" },
      "&:hover fieldset": { borderColor: "#3f3f46" },
      "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
    },
    "& .MuiInputBase-input": {
      color: "#fff",
      fontSize: "14px",
      py: 1.5,
      px: 2,
    },
  };

  const labelStyles = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#9ca3af",
    mb: 1,
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        onClick={onClose}
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
        }}
      />
      <Box
        sx={{
          position: "relative",
          bgcolor: "#121214",
          borderRadius: "16px",
          border: "1px solid #242428",
          width: "100%",
          maxWidth: 500,
          mx: 2,
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: "1px solid #242428",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>
            {editVenue ? "Edit Venue" : "New Venue"}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#6b7280" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography sx={labelStyles}>Venue Name *</Typography>
            <CustomInput
              placeholder='e.g. Dvorana Skenderija'
              value={formData.name}
              onChange={handleChange("name")}
            />
          </Box>
          <Box>
            <Typography sx={labelStyles}>Address</Typography>
            <CustomInput
              placeholder='Full address'
              value={formData.address}
              onChange={handleChange("address")}
            />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography sx={labelStyles}>City *</Typography>
              <CustomInput
                placeholder='Sarajevo'
                value={formData.city}
                onChange={handleChange("city")}
              />
            </Box>
            <Box>
              <Typography sx={labelStyles}>Capacity</Typography>
              <CustomInput
                placeholder='5000'
                value={formData.capacity}
                onChange={handleChange("capacity")}
              />
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #242428",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: "12px",
              color: "#fff",
              "&:hover": { bgcolor: "#242428" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: "12px",
              bgcolor: "#8b5cf6",
              color: "#fff",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : editVenue ? (
              "Update Venue"
            ) : (
              "Create Venue"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const VenuesPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);

  const { data, isLoading, refetch, isFetching } = useVenues({
    page: page + 1,
    limit: rowsPerPage,
    search,
  });

  const createVenue = useCreateVenue();
  const updateVenue = useUpdateVenue();
  const deleteVenue = useDeleteVenue();

  const venues = data?.data || [];
  const totalVenues = data?.pagination?.total || 0;

  const handleOpenModal = (venue = null) => {
    setEditingVenue(venue);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingVenue(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingVenue) {
        await updateVenue.mutateAsync({ id: editingVenue.id, data: formData });
      } else {
        await createVenue.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving venue:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this venue?")) {
      await deleteVenue.mutateAsync(id);
    }
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

  const cities = [...new Set(venues.map((v) => v.city).filter(Boolean))];

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title='Venues'
        subtitle='Manage sports halls and arenas'
        onRefresh={() => refetch()}
        onAdd={() => handleOpenModal()}
        addLabel='New Venue'
      />

      <StatsGrid
        stats={[
          {
            label: "Total Venues",
            value: totalVenues,
            icon: VenueIcon,
            color: "#8b5cf6",
          },
          {
            label: "Cities",
            value: cities.length,
            icon: LocationIcon,
            color: "#22c55e",
          },
          {
            label: "Total Capacity",
            value: venues
              .reduce((sum, v) => sum + (v.capacity || 0), 0)
              .toLocaleString(),
            icon: CapacityIcon,
            color: "#3b82f6",
          },
          {
            label: "Average Capacity",
            value: venues.length
              ? Math.round(
                  venues.reduce((sum, v) => sum + (v.capacity || 0), 0) /
                    venues.length,
                ).toLocaleString()
              : 0,
            icon: VenueIcon,
            color: "#f59e0b",
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
          alignItems: "center",
          gap: 2,
        }}
      >
        <FilterSearch
          placeholder='Search venues...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FormControl sx={{ minWidth: 150, ...inputStyles }}>
          <Select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            displayEmpty
            sx={{
              "& .MuiSelect-select": {
                color: cityFilter === "all" ? "#6b7280" : "#fff",
              },
            }}
          >
            <MenuItem value='all'>All Cities</MenuItem>
            {cities.map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
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
                      Venue
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
                      Address
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
                      Capacity
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
                  {venues.map((venue) => (
                    <TableRow
                      key={venue.id}
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
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "10px",
                              bgcolor: "#8b5cf615",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <VenueIcon
                              sx={{ fontSize: 20, color: "#8b5cf6" }}
                            />
                          </Box>
                          <Typography
                            sx={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#fff",
                            }}
                          >
                            {venue.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                          {venue.address || "N/A"}
                        </Typography>
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
                            {venue.city || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CapacityIcon
                            sx={{ fontSize: 16, color: "#6b7280" }}
                          />
                          <Typography
                            sx={{ fontSize: "14px", color: "#9ca3af" }}
                          >
                            {venue.capacity
                              ? venue.capacity.toLocaleString()
                              : "N/A"}
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
                          <EditButton onClick={() => handleOpenModal(venue)} />
                          <DeleteButton
                            onClick={() => handleDelete(venue.id)}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {venues.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        sx={{
                          textAlign: "center",
                          py: 8,
                          borderColor: "#242428",
                        }}
                      >
                        <Typography sx={{ color: "#6b7280" }}>
                          No venues found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component='div'
              count={totalVenues}
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

      <VenueModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={createVenue.isPending || updateVenue.isPending}
        editVenue={editingVenue}
      />
    </Box>
  );
};

export default VenuesPage;
