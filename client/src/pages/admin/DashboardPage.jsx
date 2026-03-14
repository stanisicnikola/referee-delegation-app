import { useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
  Skeleton,
} from "@mui/material";
import {
  People as PeopleIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as PendingIcon,
  ArrowForward as ArrowForwardIcon,
  PersonAdd as PersonAddIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { useDashboard, useCreateUser, useCreateMatch } from "../../hooks";
import UserModal from "../../components/user/UserModal";
import MatchModal from "../../components/ui/MatchModal";
import {
  StatsGrid,
  ActivityFeed,
  DistributionBar,
  MatchActivityChart,
} from "../../components/ui";

const DashboardPage = () => {
  const [activityPeriod, setActivityPeriod] = useState("current");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);

  const { data: dashboardData, isLoading } = useDashboard(activityPeriod);
  const createUser = useCreateUser();
  const createMatch = useCreateMatch();

  const dashboard = dashboardData?.data || {};
  const stats = dashboard.stats || {};
  const chartData = dashboard.chartData || [];
  const recentActivity = dashboard.recentActivity || [];
  const upcomingMatches = dashboard.upcomingMatches || [];

  const distribution = stats.distribution || {};

  // Stats configuration for the StatsGrid
  const statCards = [
    {
      label: "Total users",
      value: stats.totalUsers ?? 0,
      icon: PeopleIcon,
      color: "#8b5cf6",
    },
    {
      label: "Active referees",
      value: stats.activeReferees ?? 0,
      icon: PersonIcon,
      color: "#22c55e",
    },
    {
      label: "Total matches",
      value: stats.totalMatches ?? 0,
      icon: CalendarIcon,
      color: "#3b82f6",
    },
    {
      label: "Delegation rate",
      value: (stats.delegationRate ?? 0) + "%",
      icon: CheckCircleIcon,
      color: "#f97316",
    },
    {
      label: "Pending delegations",
      value: stats.pendingDelegations ?? 0,
      icon: PendingIcon,
      color: "#eab308",
    },
  ];

  const formatMatchDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const time = date.toLocaleTimeString("bs-BA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { day, month, time };
  };

  return (
    <Box sx={{ color: "#fff" }}>
      {/* Stats Grid */}
      <StatsGrid stats={statCards} loading={isLoading} columns={4} />

      {/* Charts & Distribution Row */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 3,
          mb: 4,
        }}
      >
        {/* Activity Chart */}
        <Box
          sx={{
            bgcolor: "#121214",
            borderRadius: "16px",
            border: "1px solid #242428",
            p: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>
              Match activity
            </Typography>
            <FormControl size='small'>
              <Select
                value={activityPeriod}
                onChange={(e) => setActivityPeriod(e.target.value)}
                sx={{
                  bgcolor: "#1a1a1d",
                  border: "1px solid #242428",
                  borderRadius: "8px",
                  fontSize: "14px",
                  "& .MuiSelect-select": { py: 1, px: 1.5 },
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  color: "#fff",
                  "& .MuiSvgIcon-root": { color: "#6b7280" },
                }}
              >
                <MenuItem value='current'>Current</MenuItem>
                <MenuItem value='thisMonth'>This month</MenuItem>
                <MenuItem value='lastMonth'>Last month</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <MatchActivityChart data={chartData} loading={isLoading} />
        </Box>

        {/* User Distribution */}
        <Box
          sx={{
            bgcolor: "#121214",
            borderRadius: "16px",
            border: "1px solid #242428",
            p: 3,
          }}
        >
          <Typography sx={{ fontSize: "18px", fontWeight: 600, mb: 3 }}>
            User distribution
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {isLoading ? (
              <>
                <Skeleton height={40} sx={{ bgcolor: "#242428" }} />
                <Skeleton height={40} sx={{ bgcolor: "#242428" }} />
                <Skeleton height={40} sx={{ bgcolor: "#242428" }} />
              </>
            ) : (
              <>
                <DistributionBar
                  label='Referees'
                  value={distribution.referees || 0}
                  total={stats.totalUsers || 0}
                  color='#22c55e'
                />
                <DistributionBar
                  label='Delegates'
                  value={distribution.delegates || 0}
                  total={stats.totalUsers || 0}
                  color='#3b82f6'
                />
                <DistributionBar
                  label='Admins'
                  value={distribution.admins || 0}
                  total={stats.totalUsers || 0}
                  color='#8b5cf6'
                />
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Recent Activity & Quick Actions / Upcoming */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 3,
        }}
      >
        {/* Recent Activities */}
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
            <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>
              Recent activities
            </Typography>
          </Box>
          {isLoading ? (
            <Box sx={{ p: 3 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  height={56}
                  sx={{ bgcolor: "#242428", mb: 1 }}
                />
              ))}
            </Box>
          ) : (
            <ActivityFeed items={recentActivity} />
          )}
        </Box>

        {/* Right Column: Quick Actions + Upcoming */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Quick Actions */}
          <Box
            sx={{
              bgcolor: "#121214",
              borderRadius: "16px",
              border: "1px solid #242428",
              p: 3,
            }}
          >
            <Typography sx={{ fontSize: "18px", fontWeight: 600, mb: 2 }}>
              Quick actions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Button
                fullWidth
                startIcon={
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "8px",
                      bgcolor: "rgba(139, 92, 246, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PersonAddIcon sx={{ fontSize: 20, color: "#8b5cf6" }} />
                  </Box>
                }
                onClick={() => setUserModalOpen(true)}
                sx={{
                  justifyContent: "flex-start",
                  bgcolor: "#1a1a1d",
                  color: "#fff",
                  py: 1.5,
                  px: 2,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                  "&:hover": { bgcolor: "#242428" },
                }}
              >
                Add user
              </Button>
              <Button
                fullWidth
                startIcon={
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "8px",
                      bgcolor: "rgba(249, 115, 22, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <EventIcon sx={{ fontSize: 20, color: "#f97316" }} />
                  </Box>
                }
                onClick={() => setMatchModalOpen(true)}
                sx={{
                  justifyContent: "flex-start",
                  bgcolor: "#1a1a1d",
                  color: "#fff",
                  py: 1.5,
                  px: 2,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                  "&:hover": { bgcolor: "#242428" },
                }}
              >
                New match
              </Button>
            </Box>
          </Box>

          {/* Upcoming Matches */}
          <Box
            sx={{
              bgcolor: "#121214",
              borderRadius: "16px",
              border: "1px solid #242428",
              p: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>
                Upcoming matches
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    height={64}
                    sx={{ bgcolor: "#242428", borderRadius: "10px" }}
                  />
                ))
              ) : upcomingMatches.length === 0 ? (
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: "#6b7280",
                    textAlign: "center",
                    py: 2,
                  }}
                >
                  No upcoming matches
                </Typography>
              ) : (
                upcomingMatches.map((match) => {
                  const { day, month, time } = formatMatchDate(
                    match.scheduledAt,
                  );
                  return (
                    <Box
                      key={match.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1.5,
                        bgcolor: "#1a1a1d",
                        borderRadius: "10px",
                        transition: "all 0.15s ease",
                        "&:hover": { bgcolor: "#242428" },
                      }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: "10px",
                          bgcolor: "rgba(59, 130, 246, 0.1)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#3b82f6",
                            lineHeight: 1,
                          }}
                        >
                          {day}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "10px",
                            color: "#3b82f6",
                            textTransform: "uppercase",
                            lineHeight: 1.2,
                          }}
                        >
                          {month}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#fff",
                          }}
                          noWrap
                        >
                          {match.homeTeam?.name} vs {match.awayTeam?.name}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "12px", color: "#6b7280" }}
                          noWrap
                        >
                          {match.competition?.name} · {time}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Modals */}
      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onConfirm={async (data) => {
          await createUser.mutateAsync(data);
          setUserModalOpen(false);
        }}
        isLoading={createUser.isPending}
      />
      <MatchModal
        open={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        onSubmit={async (data) => {
          await createMatch.mutateAsync(data);
          setMatchModalOpen(false);
        }}
        isLoading={createMatch.isPending}
      />
    </Box>
  );
};

export default DashboardPage;
