import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import { NavigateNext as NavigateNextIcon } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  children,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize='small' />}
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography
                key={crumb.label}
                variant='body2'
                color='text.primary'
              >
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={crumb.label}
                component={RouterLink}
                to={crumb.path}
                underline='hover'
                color='text.secondary'
                variant='body2'
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant='body1'
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
      {children}
    </Box>
  );
};

export default PageHeader;
