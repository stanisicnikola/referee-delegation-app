import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Skeleton,
  TableSortLabel,
} from "@mui/material";

const DataTable = ({
  columns,
  data = [],
  loading = false,
  page = 0,
  rowsPerPage = 10,
  totalRows = 0,
  onPageChange,
  onRowsPerPageChange,
  sortBy,
  sortOrder,
  onSort,
  emptyMessage = "No data available",
  rowKey = "id",
  onRowClick,
}) => {
  const handleSort = (columnId) => {
    if (onSort) {
      const isAsc = sortBy === columnId && sortOrder === "asc";
      onSort(columnId, isAsc ? "desc" : "asc");
    }
  };

  const renderSkeletonRows = () => {
    return Array.from({ length: rowsPerPage }).map((_, index) => (
      <TableRow key={index}>
        {columns.map((column) => (
          <TableCell key={column.id}>
            <Skeleton variant='text' width={column.width || "80%"} />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={columns.length} align='center' sx={{ py: 8 }}>
        <Typography color='text.secondary'>{emptyMessage}</Typography>
      </TableCell>
    </TableRow>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.02)",
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || "left"}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "text.secondary",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    width: column.width,
                    minWidth: column.minWidth,
                  }}
                  sortDirection={sortBy === column.id ? sortOrder : false}
                >
                  {column.sortable && onSort ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortOrder : "asc"}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? renderSkeletonRows()
              : data.length === 0
              ? renderEmptyState()
              : data.map((row) => (
                  <TableRow
                    key={row[rowKey]}
                    hover
                    onClick={() => onRowClick?.(row)}
                    sx={{
                      cursor: onRowClick ? "pointer" : "default",
                      "&:last-child td": { borderBottom: 0 },
                      transition: "background 0.15s ease",
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align || "left"}
                        sx={{
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
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
          onRowsPerPageChange={(e) =>
            onRowsPerPageChange?.(parseInt(e.target.value, 10))
          }
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
              {
                fontSize: "0.875rem",
              },
          }}
        />
      )}
    </Paper>
  );
};

export default DataTable;
