import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Avatar,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  AccessTime as PendingIcon,
  CalendarMonth as MatchesIcon,
  Groups as RefereesIcon,
  CheckCircle as ConfirmedIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import { useMatches, useReferees } from "../../hooks";

const DashboardPage = () => {
  const navigate = useNavigate();

  const { data: matchesData, isLoading: matchesLoading } = useMatches({
    limit: 100,
  });
  const { data: refereesData, isLoading: refereesLoading } = useReferees({
    limit: 100,
  });

  const matches = matchesData?.data || [];
  const referees = refereesData?.data || [];

  const isLoading = matchesLoading || refereesLoading;

  // Stats calculations
  const pendingDelegations = matches.filter(
    (m) => m.status === "scheduled" || !m.delegationStatus
  ).length;
  const weekendMatches = matches.filter((m) => {
    const matchDate = new Date(m.dateTime);
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return matchDate >= now && matchDate <= weekEnd;
  }).length;
  const activeReferees = referees.filter(
    (r) => r.user?.status === "active"
  ).length;
  const confirmedDelegations = matches.filter(
    (m) => m.delegationStatus === "confirmed"
  ).length;

  // Upcoming matches for display
  const upcomingMatches = matches
    .filter((m) => new Date(m.dateTime) >= new Date())
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .slice(0, 4);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Maj",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Okt",
      "Nov",
      "Dec",
    ];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      time: date.toLocaleTimeString("bs-BA", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getStatusBadge = (match) => {
    if (match.delegationStatus === "confirmed") {
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            fontSize: "12px",
            fontWeight: 500,
            color: "#22c55e",
            bgcolor: "rgba(34, 197, 94, 0.1)",
            px: 1.5,
            py: 0.75,
            borderRadius: "9999px",
          }}
        >
          <CheckCircle sx={{ fontSize: 14 }} />
          Delegirano
        </Box>
      );
    }
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          fontSize: "12px",
          fontWeight: 500,
          color: "#eab308",
          bgcolor: "rgba(234, 179, 8, 0.1)",
          px: 1.5,
          py: 0.75,
          borderRadius: "9999px",
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: "#eab308",
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.5 },
            },
          }}
        />
        Čeka delegiranje
      </Box>
    );
  };

  const CheckCircle = ({ sx }) => (
    <svg
      width='14'
      height='14'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      style={sx}
    >
      <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
    </svg>
  );

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
              Pregled stanja za sezonu 2024/2025
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton sx={{ color: "#9ca3af", position: "relative" }}>
              <Badge
                badgeContent={3}
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#f97316",
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: 700,
                    minWidth: 16,
                    height: 16,
                  },
                }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Box sx={{ width: 1, height: 32, bgcolor: "#242428" }} />
            <Typography
              sx={{
                fontSize: "14px",
                color: "#9ca3af",
                fontFamily: "monospace",
              }}
            >
              {new Date().toLocaleDateString("bs-BA", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Typography>
          </Box>
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
                Hitno
              </Box>
            </Box>
            <Typography
              sx={{ fontSize: "30px", fontWeight: 700, color: "#fff", mb: 0.5 }}
            >
              {isLoading ? (
                <Skeleton width={40} sx={{ bgcolor: "#242428" }} />
              ) : (
                pendingDelegations
              )}
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Čeka delegiranje
            </Typography>
          </Box>

          {/* Weekend Matches */}
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
                weekendMatches
              )}
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Utakmica ovog vikenda
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
                activeReferees
              )}
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Aktivnih sudija
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
                confirmedDelegations
              )}
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
              Potvrđenih delegacija
            </Typography>
          </Box>
        </Box>

        {/* Two Column Layout */}
        <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 3 }}>
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
                p: 3,
                borderBottom: "1px solid #242428",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}
              >
                Nadolazeće utakmice
              </Typography>
              <Box
                onClick={() => navigate("/delegate/matches")}
                sx={{
                  fontSize: "14px",
                  color: "#f97316",
                  cursor: "pointer",
                  transition: "color 0.2s",
                  "&:hover": { color: "#fb923c" },
                }}
              >
                Prikaži sve →
              </Box>
            </Box>

            {isLoading ? (
              <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={32} sx={{ color: "#f97316" }} />
              </Box>
            ) : upcomingMatches.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography sx={{ color: "#6b7280" }}>
                  Nema nadolazećih utakmica
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  "& > *:not(:last-child)": {
                    borderBottom: "1px solid #242428",
                  },
                }}
              >
                {upcomingMatches.map((match) => {
                  const dateInfo = formatDate(match.dateTime);
                  return (
                    <Box
                      key={match.id}
                      onClick={() =>
                        navigate(`/delegate/delegation/${match.id}`)
                      }
                      sx={{
                        p: 2.5,
                        cursor: "pointer",
                        transition: "background 0.15s",
                        "&:hover": { bgcolor: "rgba(26, 26, 29, 0.5)" },
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box sx={{ textAlign: "center", minWidth: 60 }}>
                          <Typography
                            sx={{
                              fontSize: "12px",
                              color: "#6b7280",
                              textTransform: "uppercase",
                            }}
                          >
                            {dateInfo.day}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "20px",
                              fontWeight: 700,
                              color: "#fff",
                            }}
                          >
                            {dateInfo.date}
                          </Typography>
                          <Typography
                            sx={{ fontSize: "12px", color: "#6b7280" }}
                          >
                            {dateInfo.month}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ height: 48, width: 1, bgcolor: "#242428" }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                fontSize: "12px",
                                fontWeight: 500,
                                color: "#f97316",
                                bgcolor: "rgba(249, 115, 22, 0.1)",
                                px: 1,
                                py: 0.25,
                                borderRadius: "4px",
                              }}
                            >
                              {match.competition?.name || "Liga"}
                            </Box>
                            <Typography
                              sx={{ fontSize: "12px", color: "#6b7280" }}
                            >
                              Kolo {match.round || "-"}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              fontSize: "15px",
                              fontWeight: 600,
                              color: "#fff",
                            }}
                          >
                            {match.homeTeam?.name || "TBA"} vs{" "}
                            {match.awayTeam?.name || "TBA"}
                          </Typography>
                          <Typography
                            sx={{ fontSize: "14px", color: "#6b7280" }}
                          >
                            {match.venue?.name || "TBA"}, {dateInfo.time}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          {getStatusBadge(match)}
                        </Box>
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
                Dostupnost sudija
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "#6b7280", mt: 0.5 }}>
                Ovaj vikend
              </Typography>
            </Box>

            {isLoading ? (
              <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={32} sx={{ color: "#f97316" }} />
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
                {referees.slice(0, 5).map((referee, index) => {
                  const colors = [
                    "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                    "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                    "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                    "linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)",
                  ];
                  const statuses = [
                    "#22c55e",
                    "#22c55e",
                    "#eab308",
                    "#ef4444",
                    "#22c55e",
                  ];

                  return (
                    <Box
                      key={referee.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: "12px",
                        bgcolor: "rgba(26, 26, 29, 0.5)",
                        opacity: statuses[index] === "#ef4444" ? 0.6 : 1,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          background: colors[index % colors.length],
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        {referee.user?.firstName?.[0]}
                        {referee.user?.lastName?.[0]}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#fff",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {referee.user?.firstName} {referee.user?.lastName}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                          Kategorija {referee.licenseCategory || "N/A"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: statuses[index],
                        }}
                        title={
                          statuses[index] === "#22c55e"
                            ? "Dostupan"
                            : statuses[index] === "#eab308"
                            ? "Djelimično"
                            : "Nedostupan"
                        }
                      />
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
                Prikaži sve sudije →
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
