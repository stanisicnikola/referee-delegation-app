import { Box, Typography, Skeleton, Tooltip } from "@mui/material";

const MatchActivityChart = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          height: 200,
          gap: 2,
          px: 1,
        }}
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Skeleton
              variant='rectangular'
              width='100%'
              height={60 + Math.random() * 100}
              sx={{
                borderRadius: "8px 8px 0 0",
                bgcolor: "#242428",
                maxWidth: 50,
              }}
            />
            <Skeleton width={30} sx={{ bgcolor: "#242428" }} />
          </Box>
        ))}
      </Box>
    );
  }

  // Find the max value to scale bars
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.matches, d.pending || 0)),
    1,
  );

  // Responsive: compact when many bars
  const isCompact = data.length > 16;

  // Only show every Nth label when very compact to avoid label crowding
  const showEveryNthLabel = data.length > 20 ? Math.ceil(data.length / 14) : 1;

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          height: 220,
          gap: isCompact ? 0.25 : 1,
          px: 0.5,
        }}
      >
        {data.map((item, index) => {
          const matchHeight = Math.max((item.matches / maxValue) * 150, 0);
          const pendingHeight = Math.max(
            ((item.pending || 0) / maxValue) * 150,
            0,
          );
          const isToday = item.date === todayKey;

          // Format tooltip date nicely
          const tooltipDate = new Date(item.date + "T12:00:00");
          const dateStr = tooltipDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });

          const tooltipContent = (
            <Box sx={{ p: 0.5 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>
                {dateStr}
                {isToday ? " (Today)" : ""}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 0.25,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "2px",
                    bgcolor: "rgba(139, 92, 246, 0.7)",
                  }}
                />
                <Typography sx={{ fontSize: "11px" }}>
                  {item.matches} match{item.matches !== 1 ? "es" : ""}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "2px",
                    bgcolor: "#f97316",
                  }}
                />
                <Typography sx={{ fontSize: "11px" }}>
                  {item.pending || 0} pending delegations
                </Typography>
              </Box>
            </Box>
          );

          return (
            <Tooltip
              key={index}
              title={tooltipContent}
              arrow
              placement='bottom'
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: "#1a1a1d",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    "& .MuiTooltip-arrow": { color: "#1a1a1d" },
                  },
                },
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                  cursor: "pointer",
                }}
              >
                {/* Bar group */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "2px",
                    width: "100%",
                    justifyContent: "center",
                    height: 170,
                  }}
                >
                  {/* Matches column (purple) */}
                  <Box
                    sx={{
                      flex: 1,
                      maxWidth: isCompact ? 10 : 20,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {item.matches > 0 && !isCompact && (
                      <Typography
                        sx={{
                          fontSize: "10px",
                          color: "rgba(139, 92, 246, 0.8)",
                          fontWeight: 600,
                          lineHeight: 1,
                          mb: 0.3,
                        }}
                      >
                        {item.matches}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        width: "100%",
                        bgcolor:
                          item.matches > 0
                            ? "rgba(139, 92, 246, 0.5)"
                            : "rgba(139, 92, 246, 0.08)",
                        borderRadius: "3px 3px 0 0",
                        height: item.matches > 0 ? matchHeight + "px" : "3px",
                        transition: "height 0.5s ease",
                        minHeight: "3px",
                      }}
                    />
                  </Box>
                  {/* Pending column (orange) */}
                  <Box
                    sx={{
                      flex: 1,
                      maxWidth: isCompact ? 10 : 20,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {(item.pending || 0) > 0 && !isCompact && (
                      <Typography
                        sx={{
                          fontSize: "10px",
                          color: "#f97316",
                          fontWeight: 600,
                          lineHeight: 1,
                          mb: 0.3,
                        }}
                      >
                        {item.pending}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        width: "100%",
                        bgcolor:
                          (item.pending || 0) > 0
                            ? "#f97316"
                            : "rgba(249, 115, 22, 0.08)",
                        borderRadius: "3px 3px 0 0",
                        height:
                          (item.pending || 0) > 0
                            ? pendingHeight + "px"
                            : "3px",
                        transition: "height 0.5s ease",
                        minHeight: "3px",
                      }}
                    />
                  </Box>
                </Box>
                {/* Day label — skip some in compact mode */}
                <Typography
                  sx={{
                    fontSize: isCompact ? "8px" : "11px",
                    color: isToday ? "#fff" : "#6b7280",
                    fontWeight: isToday ? 600 : 400,
                  }}
                >
                  {item.day}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Legend */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          mt: 3,
          pt: 3,
          borderTop: "1px solid #242428",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "4px",
              bgcolor: "rgba(139, 92, 246, 0.5)",
            }}
          />
          <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
            Matches
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "4px",
              bgcolor: "#f97316",
            }}
          />
          <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
            Pending delegation
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default MatchActivityChart;
