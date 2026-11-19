import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isDirectory = location.pathname === '/';
  const isInsights = location.pathname === '/insights';

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.025em' }}
        >
          ACME Salary Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={RouterLink}
            to="/"
            onClick={() => navigate('/')}
            sx={{
              color: isDirectory ? '#2563EB' : '#4B5563',
              fontWeight: isDirectory ? 600 : 500,
              position: 'relative',
              '&::after': isDirectory ? {
                content: '""',
                position: 'absolute',
                bottom: -13,
                left: 0,
                right: 0,
                height: 2,
                backgroundColor: '#2563EB',
                borderRadius: 1,
              } : {},
            }}
          >
            Directory
          </Button>
          <Button
            component={RouterLink}
            to="/insights"
            onClick={() => navigate('/insights')}
            sx={{
              color: isInsights ? '#2563EB' : '#4B5563',
              fontWeight: isInsights ? 600 : 500,
              position: 'relative',
              '&::after': isInsights ? {
                content: '""',
                position: 'absolute',
                bottom: -13,
                left: 0,
                right: 0,
                height: 2,
                backgroundColor: '#2563EB',
                borderRadius: 1,
              } : {},
            }}
          >
            Insights
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
