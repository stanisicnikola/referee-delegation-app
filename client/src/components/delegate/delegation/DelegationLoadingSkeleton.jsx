import { Box, Skeleton } from "@mui/material";

const DelegationLoadingSkeleton = () => (
  <Box>
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Skeleton
            variant='circular'
            width={40}
            height={40}
            sx={{ bgcolor: "#1e1e22", flexShrink: 0 }}
          />
          <Box>
            <Skeleton
              variant='text'
              width={180}
              height={28}
              sx={{ bgcolor: "#1e1e22" }}
            />
            <Skeleton
              variant='text'
              width={140}
              height={20}
              sx={{ bgcolor: "#1e1e22" }}
            />
          </Box>
        </Box>
        <Skeleton
          variant='rounded'
          width={160}
          height={42}
          sx={{ bgcolor: "#1e1e22", borderRadius: "12px" }}
        />
      </Box>
    </Box>

    <Box sx={{ display: "grid", gap: 3 }}>
      <Skeleton
        variant='rounded'
        height={156}
        sx={{ bgcolor: "#1a1a1d", borderRadius: "16px" }}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" },
          gap: 3,
        }}
      >
        {[0, 1].map((panel) => (
          <Box
            key={panel}
            sx={{
              bgcolor: "#121214",
              borderRadius: "16px",
              border: "1px solid #242428",
              overflow: "hidden",
            }}
          >
            <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #242428" }}>
              <Skeleton
                variant='text'
                width={140}
                height={28}
                sx={{ bgcolor: "#1e1e22" }}
              />
              <Skeleton
                variant='text'
                width={panel === 0 ? 220 : 130}
                height={20}
                sx={{ bgcolor: "#1e1e22" }}
              />
            </Box>
            <Box sx={{ p: 2.5, display: "grid", gap: 1.5 }}>
              {[0, 1, 2].map((row) => (
                <Skeleton
                  key={row}
                  variant='rounded'
                  height={panel === 0 ? 72 : 60}
                  sx={{ bgcolor: "#1e1e22", borderRadius: "12px" }}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);

export default DelegationLoadingSkeleton;
