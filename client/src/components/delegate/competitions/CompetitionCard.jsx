import { Box, Chip, Typography } from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  Groups as GroupsIcon,
  EmojiEvents as TrophyIcon,
  ArrowForward as ArrowIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { CustomButton } from "../../ui";
import {
  CATEGORY_LABELS,
  GENDER_LABELS,
  getCompetitionDateRange,
  getCompetitionGradient,
  getCompetitionProgress,
} from "./competitionCardUtils";

const getLabel = (labels, value) => labels[value] || "N/A";

const CompetitionCard = ({
  competition,
  index,
  onViewMatches,
  onEdit,
  onDelete,
}) => {
  const gradient = getCompetitionGradient(index);
  const progress = getCompetitionProgress(competition);

  return (
    <Box
      sx={{
        bgcolor: "#121214",
        borderRadius: "16px",
        border: "1px solid #242428",
        overflow: "hidden",
        transition: "all 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "#3f3f46",
        },
      }}
    >
      <Box
        sx={{
          minHeight: { xs: 104, sm: 92 },
          background: gradient,
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: { xs: 2, sm: 3 },
          py: 2,
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            bgcolor: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrophyIcon sx={{ color: "#fff", fontSize: 24 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 600,
              color: "#fff",
              fontSize: { xs: "16px", sm: "18px" },
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {competition.name}
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {competition.season || "Season 2024/25"}
          </Typography>
        </Box>
        <Chip
          label={competition.status}
          size='small'
          sx={{
            ml: { xs: 8, sm: "auto" },
            bgcolor: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            fontWeight: 500,
            fontSize: "12px",
            height: 24,
            maxWidth: "calc(100% - 64px)",
          }}
        />
      </Box>

      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(2, 1fr)",
            },
            gap: { xs: 1, sm: 2 },
            mb: 3,
          }}
        >
          <CompetitionInfoTile
            icon={
              <GroupsIcon sx={{ color: "#6b7280", fontSize: 20, mb: 0.5 }} />
            }
            value={getLabel(CATEGORY_LABELS, competition.category)}
            label='Category'
          />
          <CompetitionInfoTile
            icon={
              <CalendarIcon sx={{ color: "#6b7280", fontSize: 20, mb: 0.5 }} />
            }
            value={getLabel(GENDER_LABELS, competition.gender)}
            label='Gender'
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
              Season progress
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#fff",
              }}
            >
              {progress}%
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "12px", color: "#6b7280", mb: 1 }}>
            {getCompetitionDateRange(competition)}
          </Typography>
          <Box
            sx={{
              height: 6,
              bgcolor: "#242428",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${progress}%`,
                height: "100%",
                background: gradient,
                borderRadius: "3px",
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: 1 }}>
          <CustomButton
            fullWidth
            variant='secondary'
            endIcon={<ArrowIcon />}
            onClick={() => onViewMatches(competition)}
          >
            View matches
          </CustomButton>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
            }}
          >
            <CustomButton
              size='small'
              variant='secondary'
              startIcon={<EditIcon />}
              onClick={() => onEdit(competition)}
              sx={{
                minWidth: 0,
                px: 1,
                py: 0.5,
                bgcolor: "transparent",
                color: "#9ca3af",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#242428",
                  color: "#fff",
                  transform: "none",
                },
              }}
            >
              Edit
            </CustomButton>
            <CustomButton
              size='small'
              variant='secondary'
              startIcon={<DeleteIcon />}
              onClick={() => onDelete(competition)}
              sx={{
                minWidth: 0,
                px: 1,
                py: 0.5,
                bgcolor: "transparent",
                color: "#ef4444",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "rgba(239,68,68,0.1)",
                  transform: "none",
                },
              }}
            >
              Delete
            </CustomButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const CompetitionInfoTile = ({ icon, value, label }) => (
  <Box
    sx={{
      textAlign: "center",
      p: { xs: 1, sm: 1.5 },
      bgcolor: "#0a0a0b",
      borderRadius: "10px",
      minWidth: 0,
    }}
  >
    {icon}
    <Typography
      sx={{
        fontWeight: 600,
        color: "#fff",
        fontSize: { xs: "13px", sm: "14px" },
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </Typography>
    <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>{label}</Typography>
  </Box>
);

export default CompetitionCard;
