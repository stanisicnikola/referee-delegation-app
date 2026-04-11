import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import {
  AccessTime as PendingIcon,
  CalendarMonth as MatchesIcon,
  Groups as RefereesIcon,
  CheckCircle as ConfirmedIcon,
  Schedule as PartialIcon,
  Verified as CompleteIcon,
} from "@mui/icons-material";
import { useDelegateDashboard } from "../../hooks/useDelegations";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading } = useDelegateDashboard();

  const summary = dashboardData?.data?.summary || {};
  const upcomingMatches = dashboardData?.data?.upcomingMatches || [];
  const availability = dashboardData?.data?.availability || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      time: date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getStatusBadge = (match) => {
    const styles = {
      pending: {
        color: "#eab308",
        bg: "rgba(234, 179, 8, 0.1)",
        label: "Pending assignment",
        icon: <PendingIcon sx={{ fontSize: 13 }} />,
      },
      partial: {
        color: "#f97316",
        bg: "rgba(249, 115, 22, 0.1)",
        label: "Partially assigned",
        icon: <PartialIcon sx={{ fontSize: 13 }} />,
      },
      complete: {
        color: "#38bdf8",
        bg: "rgba(56, 189, 248, 0.12)",
        label: "Crew assigned",
        icon: <CompleteIcon sx={{ fontSize: 13 }} />,
      },
      confirmed: {
        color: "#22c55e",
        bg: "rgba(34, 197, 94, 0.1)",
        label: "Confirmed",
        icon: <ConfirmedIcon sx={{ fontSize: 13 }} />,
      },
    };

    const style = styles[match.delegationStatus] || {
      color: "#9ca3af",
      bg: "rgba(107, 114, 128, 0.14)",
      label: "Unknown",
      icon: null,
    };

    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          fontSize: "12px",
          fontWeight: 500,
          color: style.color,
          bgcolor: style.bg,
          px: 1.5,
          py: 0.75,
          borderRadius: "9999px",
        }}
      >
        {style.icon}
        {style.label}
      </Box>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          bgcolor: "rgba(10, 10, 11, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #242428",
          zIndex: 40,
        }}
      >
        <Box
          sx={{
            px: 4,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: "24px", fontWeight: 700, color: "#fff" }}
            >
              Dashboard
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Delegation overview
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: "14px",
              color: "#9ca3af",
              fontFamily: "monospace",
            }}
          >
            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 4 }}>
        {/* Stats Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 3,
            mb: 4,
          }}
        >
          {/* Pending Delegations */}
          <Box
            sx={{
              bgcolor: "#121214",
              borderRadius: "16px",
              p: 3,
              border: "1px solid #242428",
              transition: "all 0.2s",
              "&:hover": { borderColor: "rgba(249, 115, 22, 0.3)" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  bgcolor: "rgba(249, 115, 22, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PendingIcon sx={{ color: "#f97316", fontSize: 24 }} />
              </Box>
              <Box
                sx={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#f97316",
                  bgcolor: "rgba(249, 115, 22, 0.1)",
                  px: 1,
                  py: 0.5,
                  borderRadius: "9999px",
                }}
              >
                Urgent
              </Box>
            </Box>
            <Typography
              sx={{ fontSize: "30px", fontWeight: 700, color: "#fff", mb: 0.5 }}
            >
              {isLoading ? (
                <Skeleton width={40} sx={{ bgcolor: "#242428" }} />
              ) : (
                summary.pendingDelegations || 0
              )}
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Pending assignment
            </Typography>
          </Box>

          {/* Upcoming Matches */}
          <Box
            sx={{
              bgcolor: "#121214",
              borderRadius: "16px",
              p: 3,
              border: "1px solid #242428",
              transition: "all 0.2s",
              "&:hover": { borderColor: "rgba(59, 130, 246, 0.3)" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MatchesIcon sx={{ color: "#3b82f6", fontSize: 24 }} />
              </Box>
            </Box>
            <Typography
              sx={{ fontSize: "30px", fontWeight: 700, color: "#fff", mb: 0.5 }}
            >
              {isLoading ? (
                <Skeleton width={40} sx={{ bgcolor: "#242428" }} />
              ) : (
                summary.upcomingMatchesCount || 0
              )}
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Upcoming matches
            </Typography>
          </Box>

          {/* Active Referees */}
          <Box
            sx={{
              bgcolor: "#121214",
              borderRadius: "16px",
              p: 3,
              border: "1px solid #242428",
              transition: "all 0.2s",
              "&:hover": { borderColor: "rgba(34, 197, 94, 0.3)" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  bgcolor: "rgba(34, 197, 94, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RefereesIcon sx={{ color: "#22c55e", fontSize: 24 }} />
              </Box>
            </Box>
            <Typography
              sx={{ fontSize: "30px", fontWeight: 700, color: "#fff", mb: 0.5 }}
            >
              {isLoading ? (
                <Skeleton width={40} sx={{ bgcolor: "#242428" }} />
              ) : (
                summary.activeReferees || 0
              )}
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Active referees
            </Typography>
          </Box>

          {/* Confirmed Delegations */}
          <Box
            sx={{
              bgcolor: "#121214",
              borderRadius: "16px",
              p: 3,
              border: "1px solid #242428",
              transition: "all 0.2s",
              "&:hover": { borderColor: "rgba(139, 92, 246, 0.3)" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  bgcolor: "rgba(139, 92, 246, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ConfirmedIcon sx={{ color: "#8b5cf6", fontSize: 24 }} />
              </Box>
            </Box>
            <Typography
              sx={{ fontSize: "30px", fontWeight: 700, color: "#fff", mb: 0.5 }}
            >
              {isLoading ? (
                <Skeleton width={40} sx={{ bgcolor: "#242428" }} />
              ) : (
                summary.confirmedDelegations || 0
              )}
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Confirmed delegations
            </Typography>
          </Box>
        </Box>

        {/* Two Column Layout */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
            gap: 3,
          }}
        >
          {/* Upcoming Matches */}
          <Box
            sx={{
              bgcolor: "#121214",
              borderRadius: "16px",
              border: "1px solid #242428",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2.5,
                borderBottom: "1px solid #242428",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  sx={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}
                >
                  Upcoming matches
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#4b5563", mt: 0.25 }}>
                  Next scheduled fixtures
                </Typography>
              </Box>
              <Box
                onClick={() => navigate("/delegate/matches")}
                sx={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#f97316",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: "8px",
                  transition: "all 0.15s",
                  "&:hover": {
                    color: "#fb923c",
                    bgcolor: "rgba(249, 115, 22, 0.08)",
                  },
                }}
              >
                View all →
              </Box>
            </Box>

            {isLoading ? (
              <Box>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      px: 2.5,
                      py: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2.5,
                      borderBottom: i < 2 ? "1px solid #1a1a1d" : "none",
                    }}
                  >
                    <Skeleton
                      variant="rounded"
                      width={56}
                      height={64}
                      sx={{ bgcolor: "#1e1e22", borderRadius: "12px", flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                        <Skeleton variant="rounded" width={88} height={20} sx={{ bgcolor: "#1e1e22" }} />
                        <Skeleton variant="rounded" width={52} height={20} sx={{ bgcolor: "#1e1e22" }} />
                      </Box>
                      <Skeleton variant="text" width="65%" height={22} sx={{ bgcolor: "#1e1e22" }} />
                      <Skeleton variant="text" width="40%" height={18} sx={{ bgcolor: "#1e1e22", mt: 0.25 }} />
                    </Box>
                    <Skeleton
                      variant="rounded"
                      width={112}
                      height={28}
                      sx={{ bgcolor: "#1e1e22", borderRadius: "9999px", flexShrink: 0 }}
                    />
                  </Box>
                ))}
              </Box>
            ) : upcomingMatches.length === 0 ? (
              <Box
                sx={{
                  py: 7,
                  px: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1.5,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "14px",
                    bgcolor: "rgba(249, 115, 22, 0.07)",
                    border: "1px solid rgba(249, 115, 22, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 0.5,
                  }}
                >
                  <MatchesIcon sx={{ fontSize: 26, color: "#f97316", opacity: 0.55 }} />
                </Box>
                <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#9ca3af" }}>
                  No upcoming matches
                </Typography>
                <Typography sx={{ fontSize: "13px", color: "#4b5563", maxWidth: 240 }}>
                  No fixtures scheduled for the next period
                </Typography>
              </Box>
            ) : (
              <Box>
                {upcomingMatches.map((match, idx) => {
                  const dateInfo = formatDate(match.scheduledAt);
                  const isConfirmed = match.delegationStatus === "confirmed";
                  return (
                    <Box
                      key={match.id}
                      onClick={() => navigate(`/delegate/delegation/${match.id}`)}
                      sx={{
                        px: 2.5,
                        py: 2,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 2.5,
                        borderBottom:
                          idx < upcomingMatches.length - 1
                            ? "1px solid #1a1a1d"
                            : "none",
                        borderLeft: "2px solid transparent",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          bgcolor: "rgba(249, 115, 22, 0.04)",
                          borderLeftColor: isConfirmed ? "#22c55e" : "#f97316",
                        },
                      }}
                    >
                      {/* Date block */}
                      <Box
                        sx={{
                          width: 56,
                          height: 64,
                          borderRadius: "12px",
                          bgcolor: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid #242428",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          gap: "1px",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#f97316",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            lineHeight: 1,
                          }}
                        >
                          {dateInfo.day}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "22px",
                            fontWeight: 800,
                            color: "#fff",
                            lineHeight: 1.1,
                          }}
                        >
                          {dateInfo.date}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "10px",
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            lineHeight: 1,
                          }}
                        >
                          {dateInfo.month}
                        </Typography>
                      </Box>

                      {/* Match info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Badges row */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            mb: 0.75,
                            flexWrap: "wrap",
                          }}
                        >
                          <Box
                            sx={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#f97316",
                              bgcolor: "rgba(249, 115, 22, 0.1)",
                              px: 1,
                              py: "2px",
                              borderRadius: "4px",
                              lineHeight: 1.7,
                              maxWidth: 150,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {match.competition?.name || "League"}
                          </Box>
                          <Box
                            sx={{
                              fontSize: "11px",
                              color: "#4b5563",
                              bgcolor: "#1a1a1d",
                              px: 1,
                              py: "2px",
                              borderRadius: "4px",
                              lineHeight: 1.7,
                            }}
                          >
                            Round {match.round || "–"}
                          </Box>
                        </Box>

                        {/* Teams matchup */}
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#f3f4f6",
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {match.homeTeam?.name || "TBA"}
                          <Box
                            component="span"
                            sx={{ color: "#4b5563", fontWeight: 400, mx: 0.75 }}
                          >
                            vs
                          </Box>
                          {match.awayTeam?.name || "TBA"}
                        </Typography>

                        {/* Venue + time */}
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "#6b7280",
                            mt: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {match.venue?.name || "Venue TBA"}
                          <Box component="span" sx={{ mx: 0.75, color: "#333338" }}>
                            ·
                          </Box>
                          {dateInfo.time}
                        </Typography>
                      </Box>

                      {/* Status chip */}
                      <Box sx={{ flexShrink: 0 }}>
                        {getStatusBadge(match)}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Referee Availability */}
          <Box
            sx={{
              bgcolor: "#121214",
              borderRadius: "16px",
              border: "1px solid #242428",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 3, borderBottom: "1px solid #242428" }}>
              <Typography
                sx={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}
              >
                Referee availability
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "#6b7280", mt: 0.5 }}>
                Next 7 days
              </Typography>
            </Box>

            {isLoading ? (
              <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={32} sx={{ color: "#f97316" }} />
              </Box>
            ) : availability.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography sx={{ color: "#6b7280" }}>
                  No availability data
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                {availability.slice(0, 5).map((day) => {
                  const availableReferees = day.referees || [];
                  const statusColor =
                    day.availableCount > 10
                      ? "#22c55e"
                      : day.availableCount > 5
                        ? "#eab308"
                        : "#ef4444";

                  return (
                    <Box
                      key={day.date}
                      sx={{
                        p: 1.5,
                        borderRadius: "12px",
                        bgcolor: "rgba(26, 26, 29, 0.5)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                        >
                          {new Date(day.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: statusColor,
                            }}
                          />
                          <Typography
                            sx={{ fontSize: "12px", color: "#6b7280" }}
                          >
                            {day.availableCount} available
                          </Typography>
                        </Box>
                      </Box>
                      {availableReferees.length > 0 && (
                        <Box
                          sx={{
                            fontSize: "11px",
                            color: "#6b7280",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {availableReferees.map((r) => r.name).join(", ")}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}

            <Box sx={{ p: 2, borderTop: "1px solid #242428" }}>
              <Box
                onClick={() => navigate("/delegate/referees")}
                sx={{
                  textAlign: "center",
                  fontSize: "14px",
                  color: "#f97316",
                  py: 1,
                  cursor: "pointer",
                  transition: "color 0.2s",
                  "&:hover": { color: "#fb923c" },
                }}
              >
                View all referees →
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
