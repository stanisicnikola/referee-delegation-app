import { Controller } from "react-hook-form";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { CustomButton, FormValidationError } from "../../ui";
import {
  AVAILABILITY_COLORS as COLORS,
  UNAVAILABILITY_REASONS,
} from "./constants";

const fieldLabelSx = {
  mb: 1,
  color: COLORS.mutedStrong,
  fontSize: 14,
  fontWeight: 700,
};

const AvailabilityRequestDialog = ({
  open,
  control,
  errors,
  todayKey,
  dateFromValue,
  isSubmitting,
  onClose,
  onSubmit,
  onDateFromChange,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth='sm'
    slotProps={{
      paper: {
        sx: {
          bgcolor: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "18px",
          overflow: "hidden",
        },
      },
    }}
  >
    <DialogTitle
      sx={{
        px: { xs: 2.5, sm: 4 },
        py: { xs: 2.5, sm: 3 },
        borderBottom: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Typography
        component='span'
        sx={{
          color: COLORS.text,
          fontSize: { xs: 18, sm: 28 },
          fontWeight: 600,
        }}
      >
        Report unavailability
      </Typography>
      <IconButton onClick={onClose} sx={{ color: COLORS.text }}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>

    <DialogContent
      sx={{
        mt: 3,
        px: { xs: 2.5, sm: 4 },
        pb: { xs: 3, sm: 4 },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: { xs: 3.25, sm: 3 },
        }}
      >
        <DateField
          name='dateFrom'
          label='From date *'
          control={control}
          error={errors.dateFrom}
          min={todayKey}
          onChange={onDateFromChange}
        />
        <DateField
          name='dateTo'
          label='To date *'
          control={control}
          error={errors.dateTo}
          min={dateFromValue || todayKey}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography sx={fieldLabelSx}>Reason *</Typography>
        <Controller
          name='reason'
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.reason}>
              <Select
                {...field}
                displayEmpty
                renderValue={(selected) =>
                  selected ? (
                    selected
                  ) : (
                    <Typography sx={{ color: COLORS.muted }}>
                      Select reason...
                    </Typography>
                  )
                }
              >
                <MenuItem value='' disabled>
                  Select reason...
                </MenuItem>
                {UNAVAILABILITY_REASONS.map((reason) => (
                  <MenuItem key={reason} value={reason}>
                    {reason}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <FormValidationError>{errors.reason?.message}</FormValidationError>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography sx={fieldLabelSx}>Description</Typography>
        <Controller
          name='description'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              placeholder='Additional information...'
              multiline
              minRows={4}
              fullWidth
              error={!!errors.description}
            />
          )}
        />
        <FormValidationError>{errors.description?.message}</FormValidationError>
      </Box>
    </DialogContent>

    <DialogActions
      sx={{
        px: { xs: 2.5, sm: 4 },
        py: { xs: 2.5, sm: 3 },
        borderTop: `1px solid ${COLORS.border}`,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: { xs: 1.5, sm: 2 },
        "& > :not(style)": {
          width: "100%",
          m: 0,
        },
        "& > :not(style) ~ :not(style)": {
          ml: "0 !important",
        },
      }}
    >
      <CustomButton
        variant='secondary'
        onClick={onClose}
        disabled={isSubmitting}
        sx={{ justifyContent: "center", minHeight: { xs: 48, sm: 52 } }}
      >
        Cancel
      </CustomButton>
      <CustomButton
        variant='referee-primary'
        onClick={onSubmit}
        loading={isSubmitting}
        sx={{ justifyContent: "center", minHeight: { xs: 48, sm: 52 } }}
      >
        Report
      </CustomButton>
    </DialogActions>
  </Dialog>
);

const DateField = ({ name, label, control, error, min, onChange }) => (
  <Box>
    <Typography sx={fieldLabelSx}>{label}</Typography>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          type='date'
          fullWidth
          error={!!error}
          onChange={(event) => {
            field.onChange(event);
            onChange?.(event.target.value);
          }}
          slotProps={{ htmlInput: { min } }}
        />
      )}
    />
    <FormValidationError>{error?.message}</FormValidationError>
  </Box>
);

export default AvailabilityRequestDialog;
