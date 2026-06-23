import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
} from "@mui/material";
import LoadingSpinner from "./LoadingSpinner";

const DataTable = ({
  columns,
  data = [],
  loading = false,
  page = 0,
  rowsPerPage = 10,
  totalRows = 0,
  onPageChange,
  onRowsPerPageChange,
  emptyMessage = "No data available",
  rowKey = "id",
  onRowClick,
  getRowSx,
}) => {
  const tableMinWidth = Math.max(
    720,
    columns.reduce((total, column) => {
      const width = Number.parseInt(column.minWidth || column.width || 140, 10);
      return total + (Number.isNaN(width) ? 140 : width);
    }, 0),
  );

  const renderEmptyState = () => (
    <TableRow>
      <TableCell
        colSpan={columns.length}
        sx={{
          textAlign: "center",
          py: 8,
          borderColor: "#242428",
        }}
      >
        <Typography sx={{ color: "#6b7280" }}>{emptyMessage}</Typography>
      </TableCell>
    </TableRow>
  );

  return (
    <Box
      sx={{
        bgcolor: "#121214",
        border: "1px solid #242428",
        borderRadius: "16px",
        overflow: "hidden",
        maxWidth: "100%",
        minWidth: 0,
      }}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <TableContainer
            sx={{
              maxWidth: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              "&::-webkit-scrollbar": { height: 8 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "#2e2e33",
                borderRadius: "9999px",
              },
            }}
          >
            <Table sx={{ minWidth: tableMinWidth }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#0a0a0b" }}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || "left"}
                      sx={{
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        borderColor: "#242428",
                        width: column.width,
                        minWidth: column.minWidth,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0
                  ? renderEmptyState()
                  : data.map((row) => {
                      const isClickable = Boolean(onRowClick);

                      return (
                        <TableRow
                          key={row[rowKey]}
                          onClick={
                            onRowClick ? () => onRowClick(row) : undefined
                          }
                          sx={{
                            whiteSpace: "nowrap",
                            cursor: isClickable ? "pointer" : "default",
                            "&:hover": { bgcolor: "#1a1a1d" },
                            "& td": { borderColor: "#242428" },
                            ...(getRowSx ? getRowSx(row) : {}),
                          }}
                        >
                          {columns.map((column) => (
                            <TableCell
                              key={column.id}
                              align={column.align || "left"}
                            >
                              {column.render
                                ? column.render(row[column.id], row)
                                : row[column.id]}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </TableContainer>

          {onPageChange && (
            <TablePagination
              component='div'
              count={totalRows}
              page={page}
              onPageChange={(_, newPage) => onPageChange(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                onRowsPerPageChange?.(parseInt(e.target.value, 10));
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
          )}
        </>
      )}
    </Box>
  );
};

export default DataTable;
