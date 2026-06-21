import { Box, Typography, Checkbox, FormControlLabel } from "@mui/material";
import { Controller } from "react-hook-form";
import { CustomInput, CustomSelect, PasswordInput } from "../ui";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const LICENSE_CATEGORY_OPTIONS = [
  { value: "international", label: "International" },
  { value: "A", label: "Category A" },
  { value: "B", label: "Category B" },
  { value: "C", label: "Category C" },
  { value: "regional", label: "Regional" },
];

const RefereeForm = ({
  control,
  errors,
  editUser,
  variant = "admin",
  accentColor = "#8b5cf6",
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: "rgba(26, 26, 29, 0.5)",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography
          sx={{ fontSize: "14px", fontWeight: 500, color: "#9ca3af" }}
        >
          General Information
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Box>
            <Controller
              name='firstName'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  label='First Name *'
                  placeholder='Enter first name'
                  error={errors?.firstName?.message}
                  accentColor={accentColor}
                />
              )}
            />
          </Box>
          <Box>
            <Controller
              name='lastName'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  label='Last Name *'
                  placeholder='Enter last name'
                  error={errors?.lastName?.message}
                  accentColor={accentColor}
                />
              )}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Box>
            <Controller
              name='email'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  label='Email *'
                  type='email'
                  placeholder='email@example.com'
                  error={errors?.email?.message}
                  accentColor={accentColor}
                />
              )}
            />
          </Box>
          <Box>
            <Controller
              name='phone'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  label='Phone'
                  placeholder='+387 6X XXX XXX'
                  error={errors?.phone?.message}
                  accentColor={accentColor}
                />
              )}
            />
          </Box>
        </Box>

        {editUser && (
          <Box>
            <Controller
              name='status'
              control={control}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  label='Status *'
                  options={STATUS_OPTIONS}
                  variant={variant}
                  error={errors?.status?.message}
                />
              )}
            />
          </Box>
        )}
      </Box>

      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: "rgba(26, 26, 29, 0.5)",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography
          sx={{ fontSize: "14px", fontWeight: 500, color: "#9ca3af" }}
        >
          Referee Details
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Box>
            <Controller
              name='licenseNumber'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  label='License Number *'
                  placeholder='SUD-XXXX-XXX'
                  error={errors?.licenseNumber?.message}
                  accentColor={accentColor}
                />
              )}
            />
          </Box>
          <Box>
            <Controller
              name='licenseCategory'
              control={control}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  label='Category *'
                  options={LICENSE_CATEGORY_OPTIONS}
                  variant={variant}
                  error={errors?.licenseCategory?.message}
                />
              )}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Box>
            <Controller
              name='city'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  label='City *'
                  placeholder='e.g. Sarajevo'
                  error={errors?.city?.message}
                  accentColor={accentColor}
                />
              )}
            />
          </Box>
          <Box>
            <Controller
              name='experienceYears'
              control={control}
              render={({ field }) => (
                <CustomInput
                  {...field}
                  label='Years of Experience'
                  autoComplete='on'
                  placeholder='0'
                  error={errors?.experienceYears?.message}
                  accentColor={accentColor}
                />
              )}
            />
          </Box>
        </Box>
      </Box>

      {!editUser && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Box>
            <Controller
              name='password'
              control={control}
              render={({ field }) => (
                <PasswordInput
                  {...field}
                  label='Password *'
                  placeholder='Minimum 8 characters'
                  autoComplete='off'
                  error={errors?.password?.message}
                  accentColor={accentColor}
                />
              )}
            />
          </Box>
          <Box>
            <Controller
              name='confirmPassword'
              control={control}
              render={({ field }) => (
                <PasswordInput
                  {...field}
                  label='Confirm Password *'
                  placeholder='Repeat password'
                  autoComplete='off'
                  error={errors?.confirmPassword?.message}
                  accentColor={accentColor}
                />
              )}
            />
          </Box>
        </Box>
      )}

      {!editUser && (
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 4 },
          }}
        >
          <Controller
            name='sendWelcomeEmail'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...field}
                    checked={field.value}
                    sx={{
                      color: "#3f3f46",
                      "&.Mui-checked": { color: accentColor },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                    Send welcome email
                  </Typography>
                }
              />
            )}
          />
          <Controller
            name='requirePasswordChange'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...field}
                    checked={field.value}
                    sx={{
                      color: "#3f3f46",
                      "&.Mui-checked": { color: accentColor },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "14px", color: "#9ca3af" }}>
                    Require password change
                  </Typography>
                }
              />
            )}
          />
        </Box>
      )}
    </Box>
  );
};

export default RefereeForm;
