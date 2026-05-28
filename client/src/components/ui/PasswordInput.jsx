import { useState } from "react";
import { InputAdornment, IconButton } from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockOutline as LockIcon,
} from "@mui/icons-material";
import CustomInput from "./CustomInput";

const PasswordInput = ({ label, error, slotProps = {}, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <CustomInput
      label={label}
      error={error}
      type={showPassword ? "text" : "password"}
      {...props}
      slotProps={{
        ...slotProps,
        input: {
          ...slotProps.input,
          startAdornment: (
            <InputAdornment position='start'>
              <LockIcon edge='start' sx={{ color: "grey.500" }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton
                type='button'
                onClick={toggleVisibility}
                onMouseDown={(event) => event.preventDefault()}
                edge='end'
                sx={{ color: "grey.400" }}
              >
                {showPassword ? (
                  <VisibilityOff sx={{ fontSize: 20 }} />
                ) : (
                  <Visibility sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default PasswordInput;
