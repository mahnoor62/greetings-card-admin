import { useTheme } from '@mui/material/styles';
import {
  Box
} from '@mui/material';
export const Logo = () => {
  const theme = useTheme();
  const fillColor = theme.palette.primary.main;

  return (
    <Box
      href="/"
      sx={{
        display: 'flex',
      }}
    >
    </Box>
  );
};
