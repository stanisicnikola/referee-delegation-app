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
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  PersonAdd as PersonAddIcon,
  Event as EventIcon,
  Login as LoginIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import {
  useUsers,
  useReferees,
  useMatches,
  useTeams,
  useCreateUser,
  useCreateMatch,
} from "../../hooks";
import UserModal from "../../components/user/UserModal";
import MatchModal from "../../components/ui/MatchModal";

const DashboardPage = () => {
  const [activityPeriod, setActivityPeriod] = useState("7days");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);

  const { data: usersData, isLoading: usersLoading } = useUsers();
  const { data: refereesData, isLoading: refereesLoading } = useReferees();
  const { data: matchesData, isLoading: matchesLoading } = useMatches();
  const { data: teamsData, isLoading: teamsLoading } = useTeams();

  const createUser = useCreateUser();
  const createMatch = useCreateMatch();

  const users = usersData?.data?.users || usersData?.data || [];
  const referees = refereesData?.data?.referees || refereesData?.data || [];
  const matches = matchesData?.data?.matches || matchesData?.data || [];
  const _teams = teamsData?.data?.teams || teamsData?.data || []; // Available for future use

  const totalUsers = Array.isArray(users) ? users.length : 0;
  const totalReferees = Array.isArray(referees) ? referees.length : 0;
  const totalMatches = Array.isArray(matches) ? matches.length : 0;
  const admins = Array.isArray(users)
    ? users.filter((u) => u.role === "admin").length
    : 0;
  const delegates = Array.isArray(users)
    ? users.filter((u) => u.role === "delegate").length
    : 0;
  const pendingDelegations = Array.isArray(matches)
    ? matches.filter((m) => !m.referees || m.referees.length === 0).length
    : 0;
  const matchesWithReferees = Array.isArray(matches)
    ? matches.filter((m) => m.referees && m.referees.length > 0).length
    : 0;
  const delegationRate =
    totalMatches > 0
      ? Math.round((matchesWithReferees / totalMatches) * 100)
      : 0;

  const isLoading =
    usersLoading || refereesLoading || matchesLoading || teamsLoading;

  const chartData = [
    { day: "Mon", value: 60 },
    { day: "Tue", value: 80 },
    { day: "Wed", value: 45 },
    { day: "Thu", value: 90 },
    { day: "Fri", value: 70 },
    { day: "Sat", value: 100 },
    { day: "Sun", value: 55 },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "create",
      title: "New delegation created",
      description: "Admin delegated match KK Bosna vs KK Čelik",
      time: "15 min ago",
      icon: AddIcon,
      color: "#22c55e",
      bgColor: "rgba(34, 197, 94, 0.1)",
    },
    {
      id: 2,
      type: "login",
      title: "User logged in",
      description: "Referee Adnan Hodžić - IP: 185.xx.xx.xx",
      time: "32 min ago",
      icon: LoginIcon,
      color: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.1)",
    },
    {
      id: 3,
      type: "update",
      title: "Match updated",
      description: "Changed time for KK Široki vs KK Zrinjski",
      time: "1 hour ago",
      icon: EditIcon,
      color: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.1)",
    },
    {
      id: 4,
      type: "create",
      title: "New user registered",
      description: "Ivan Perić added as referee (Category B)",
      time: "2 hours ago",
      icon: PersonAddIcon,
      color: "#22c55e",
      bgColor: "rgba(34, 197, 94, 0.1)",
    },
  ];

  const systemStatus = [
    { name: "API Server", status: "online" },
    { name: "Database", status: "online" },
    { name: "Email Service", status: "online" },
    { name: "SMS Gateway", status: "degraded" },
  ];

  const StatCard = (props) => {
    const { title, value, icon: Icon, color, bgColor, trend } = props;
    return (
      <Box
        sx={{
          bgcolor: "#121214",
          borderRadius: "16px",
          p: 2.5,
          border: "1px solid #242428",
          transition: "all 0.2s ease",
          "&:hover": { transform: "translateY(-2px)" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              bgcolor: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ fontSize: 20, color }} />
          </Box>
          {trend && (
            <Typography sx={{ fontSize: "12px", color: "#22c55e" }}>
              {trend}
            </Typography>
          )}
        </Box>
        <Typography
          sx={{ fontSize: "24px", fontWeight: 700, color: "#fff", mb: 0.5 }}
        >
          {isLoading ? (
            <Skeleton width={60} sx={{ bgcolor: "#242428" }} />
          ) : (
            value
          )}
        </Typography>
        <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
          {title}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ color: "#fff" }}>
      {/* Stats Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(5, 1fr)",
          },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard
          title='Total Users'
          value={totalUsers}
          icon={PeopleIcon}
          color='#8b5cf6'
          bgColor='rgba(139, 92, 246, 0.1)'
          trend='+3 this month'
        />
        <StatCard
          title='Active Referees'
          value={totalReferees}
          icon={PersonIcon}
          color='#22c55e'
          bgColor='rgba(34, 197, 94, 0.1)'
        />
        <StatCard
          title='Season Matches'
          value={totalMatches}
          icon={CalendarIcon}
          color='#3b82f6'
          bgColor='rgba(59, 130, 246, 0.1)'
        />
        <StatCard
          title='Confirmation Rate'
          value={delegationRate + "%"}
          icon={CheckCircleIcon}
          color='#f97316'
          bgColor='rgba(249, 115, 22, 0.1)'
        />
        <StatCard
          title='Awaiting Delegation'
          value={pendingDelegations}
          icon={PendingIcon}
          color='#eab308'
          bgColor='rgba(234, 179, 8, 0.1)'
        />
      </Box>

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
              System Activity
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
                <MenuItem value='7days'>Last 7 days</MenuItem>
                <MenuItem value='30days'>Last 30 days</MenuItem>
                <MenuItem value='season'>This season</MenuItem>
              </Select>
            </FormControl>
          </Box>

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
            {chartData.map((item, index) => (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 50,
                    bgcolor:
                      index === 5 ? "#f97316" : "rgba(139, 92, 246, 0.3)",
                    borderRadius: "8px 8px 0 0",
                    height: item.value * 1.8 + "px",
                    transition: "height 0.5s ease",
                  }}
                />
                <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                  {item.day}
                </Typography>
              </Box>
            ))}
          </Box>

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
                  bgcolor: "rgba(139, 92, 246, 0.3)",
                }}
              />
              <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                Delegations
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
                Matches
              </Typography>
            </Box>
          </Box>
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
            User Distribution
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                  Referees
                </Typography>
                <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                  {totalReferees}
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 8,
                  bgcolor: "#242428",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    bgcolor: "#22c55e",
                    borderRadius: "4px",
                    width:
                      totalUsers > 0
                        ? Math.min((totalReferees / totalUsers) * 100, 100) +
                          "%"
                        : "0%",
                    transition: "width 0.5s ease",
                  }}
                />
              </Box>
            </Box>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                  Delegates
                </Typography>
                <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                  {delegates}
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 8,
                  bgcolor: "#242428",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    bgcolor: "#3b82f6",
                    borderRadius: "4px",
                    width:
                      totalUsers > 0
                        ? Math.min((delegates / totalUsers) * 100, 100) + "%"
                        : "0%",
                    transition: "width 0.5s ease",
                  }}
                />
              </Box>
            </Box>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                  Admins
                </Typography>
                <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                  {admins}
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 8,
                  bgcolor: "#242428",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    bgcolor: "#8b5cf6",
                    borderRadius: "4px",
                    width:
                      totalUsers > 0
                        ? Math.min((admins / totalUsers) * 100, 100) + "%"
                        : "0%",
                    transition: "width 0.5s ease",
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #242428" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                Online now
              </Typography>
              <Typography
                sx={{ fontSize: "14px", fontWeight: 500, color: "#22c55e" }}
              >
                1 user
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Recent Activity & Quick Actions */}
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
              Recent Activities
            </Typography>
            <Button
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: "#8b5cf6",
                fontSize: "14px",
                textTransform: "none",
                "&:hover": { bgcolor: "transparent", color: "#a78bfa" },
              }}
            >
              View all
            </Button>
          </Box>
          <Box>
            {recentActivities.map((activity, index) => (
              <Box
                key={activity.id}
                sx={{
                  p: 2,
                  px: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  borderBottom:
                    index < recentActivities.length - 1
                      ? "1px solid #242428"
                      : "none",
                  borderLeft: "3px solid " + activity.color,
                  transition: "background 0.15s ease",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: activity.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <activity.icon sx={{ fontSize: 20, color: activity.color }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{ fontSize: "14px", fontWeight: 500, mb: 0.25 }}
                  >
                    {activity.title}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "13px", color: "#6b7280" }}
                    noWrap
                  >
                    {activity.description}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#6b7280",
                    fontFamily: "monospace",
                    flexShrink: 0,
                  }}
                >
                  {activity.time}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right Column */}
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
              Quick Actions
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
                Add User
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
                New Match
              </Button>
              <Button
                fullWidth
                startIcon={
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "8px",
                      bgcolor: "rgba(59, 130, 246, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <DownloadIcon sx={{ fontSize: 20, color: "#3b82f6" }} />
                  </Box>
                }
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
                Export Report
              </Button>
            </Box>
          </Box>

          {/* System Status */}
          <Box
            sx={{
              bgcolor: "#121214",
              borderRadius: "16px",
              border: "1px solid #242428",
              p: 3,
            }}
          >
            <Typography sx={{ fontSize: "18px", fontWeight: 600, mb: 2 }}>
              System Status
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {systemStatus.map((item) => (
                <Box
                  key={item.name}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                    {item.name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor:
                          item.status === "online" ? "#22c55e" : "#eab308",
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "14px",
                        color: item.status === "online" ? "#22c55e" : "#eab308",
                      }}
                    >
                      {item.status === "online" ? "Online" : "Degraded"}
                    </Typography>
                  </Box>
                </Box>
              ))}
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
