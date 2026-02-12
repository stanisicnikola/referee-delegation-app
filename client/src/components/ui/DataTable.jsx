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
}) => {
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
      }}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <TableContainer>
            <Table>
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
                  : data.map((row) => (
                      <TableRow
                        key={row[rowKey]}
                        sx={{
                          "&:hover": { bgcolor: "#1a1a1d" },
                          "& td": { borderColor: "#242428" },
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
                    ))}
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
