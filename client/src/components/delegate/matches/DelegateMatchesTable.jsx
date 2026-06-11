import { Box, Typography } from "@mui/material";
import { DataTable } from "../../ui";
import DelegationStatusBadge from "../DelegationStatusBadge";
import MatchTitle from "../../../utils/MatchTitle";
import { delegatePanelColors as COLORS } from "../../../theme/theme";
import CompetitionBadge from "../../matches/CompetitionBadge";
import MatchDateTime from "../../matches/MatchDateTime";
import MatchVenue from "../../matches/MatchVenue";
import DelegationActionButton from "./DelegationActionButton";
import ManagementActions from "./ManagementActions";

const DelegateMatchesTable = ({
  matches,
  loading,
  page,
  rowsPerPage,
  totalRows,
  hasFilters,
  onPageChange,
  onRowsPerPageChange,
  onOpenMatch,
  onEditMatch,
  onDeleteMatch,
}) => (
  <DataTable
    columns={[
      {
        id: "scheduledAt",
        label: "Date",
        width: 120,
        render: (_, match) => <MatchDateTime scheduledAt={match.scheduledAt} />,
      },
      {
        id: "match",
        label: "Match",
        minWidth: 260,
        render: (_, match) => (
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
              <MatchTitle match={match} />
            </Typography>
            <Typography sx={{ fontSize: 12, color: COLORS.muted }}>
              Round {match.round || "-"}
            </Typography>
          </Box>
        ),
      },
      {
        id: "competition",
        label: "Competition",
        width: 150,
        render: (_, match) => (
          <CompetitionBadge competition={match.competition} />
        ),
      },
      {
        id: "venue",
        label: "Venue",
        minWidth: 180,
        render: (_, match) => <MatchVenue venue={match.venue} />,
      },
      {
        id: "delegationStatus",
        label: "Delegation Status",
        width: 160,
        render: (_, match) => (
          <DelegationStatusBadge status={match.delegationStatus} compact />
        ),
      },
      {
        id: "actions",
        label: "",
        align: "right",
        minWidth: 190,
        render: (_, match) => (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "flex-end",
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            <DelegationActionButton
              status={match.delegationStatus}
              onClick={(event) => {
                event.stopPropagation();
                onOpenMatch(match);
              }}
            />
            <ManagementActions
              match={match}
              onEdit={onEditMatch}
              onDelete={onDeleteMatch}
            />
          </Box>
        ),
      },
    ]}
    data={matches}
    loading={loading}
    page={page}
    rowsPerPage={rowsPerPage}
    totalRows={totalRows}
    onPageChange={onPageChange}
    onRowsPerPageChange={onRowsPerPageChange}
    emptyMessage={
      hasFilters
        ? "No matches found. Try adjusting your filters."
        : "No matches available at this time."
    }
    onRowClick={onOpenMatch}
    getRowSx={() => ({
      borderLeft: "2px solid transparent",
      transition: "background-color 0.15s ease, border-color 0.15s ease",
      "&:hover": {
        bgcolor: "rgba(249, 115, 22, 0.03)",
        borderLeftColor: "rgba(249, 115, 22, 0.35)",
      },
    })}
    rowKey='id'
  />
);

export default DelegateMatchesTable;
