import { useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  Stadium as VenueIcon,
  LocationOn as LocationIcon,
  People as CapacityIcon,
} from "@mui/icons-material";
import {
  useVenues,
  useCreateVenue,
  useUpdateVenue,
  useDeleteVenue,
  useVenueStatistics,
} from "../../hooks/admin";
import { VenueModal } from "../../components/user/VenueModal";
import {
  ConfirmDialog,
  PageHeader,
  StatsGrid,
  EditButton,
  DeleteButton,
  DataTable,
  FilterSearch,
} from "../../components/ui";

const VenuesPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState(null);

  const { data, isLoading, refetch, isFetching } = useVenues({
    page: page + 1,
    limit: rowsPerPage,
    search,
  });

  const { data: statisticsData } = useVenueStatistics();

  const createVenue = useCreateVenue();
  const updateVenue = useUpdateVenue();
  const deleteVenue = useDeleteVenue();

  const venues = data?.data || [];
  const totalVenues = data?.pagination?.total || 0;

  const stats = statisticsData?.data || {
    total: 0,
    cities: 0,
    totalCapacity: 0,
    avgCapacity: 0,
  };

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

  const handleOpenDialog = (venue) => {
    setVenueToDelete(venue);
    setConfirmDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
    setVenueToDelete(null);
  };

  const handleDelete = async () => {
    try {
      await deleteVenue.mutateAsync(venueToDelete.id);
    } catch (error) {
      // Error toast handled by hook
    } finally {
      handleCloseDialog();
    }
  };

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
            value: stats.total,
            icon: VenueIcon,
            color: "#8b5cf6",
          },
          {
            label: "Cities",
            value: stats.cities,
            icon: LocationIcon,
            color: "#3b82f6",
          },
          {
            label: "Total Capacity",
            value: stats.totalCapacity.toLocaleString(),
            icon: CapacityIcon,
            color: "#22c55e",
          },
          {
            label: "Avg. Capacity",
            value: stats.avgCapacity.toLocaleString(),
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
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
        }}
      >
        <FilterSearch
          placeholder='Search venues...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* Table */}
      <DataTable
        columns={[
          {
            id: "name",
            label: "Venue",
            render: (_, venue) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
                  <VenueIcon sx={{ fontSize: 20, color: "#8b5cf6" }} />
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
            ),
          },
          {
            id: "address",
            label: "Address",
            render: (address) => (
              <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                {address || "N/A"}
              </Typography>
            ),
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
            id: "capacity",
            label: "Capacity",
            render: (capacity) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CapacityIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
                <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                  {capacity ? capacity.toLocaleString() : "N/A"}
                </Typography>
              </Box>
            ),
          },
          {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (_, venue) => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 0.5,
                }}
              >
                <EditButton onClick={() => handleOpenModal(venue)} />
                <DeleteButton onClick={() => handleOpenDialog(venue)} />
              </Box>
            ),
          },
        ]}
        data={venues}
        loading={isLoading || isFetching}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalVenues}
        onPageChange={setPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        emptyMessage='No venues found'
      />

      <VenueModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={createVenue.isPending || updateVenue.isPending}
        editVenue={editingVenue}
      />
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleDelete}
        title='Delete Venue'
        message='Are you sure you want to delete this venue?'
        confirmText='Delete'
        loading={deleteVenue.isPending}
      />
    </Box>
  );
};

export default VenuesPage;
