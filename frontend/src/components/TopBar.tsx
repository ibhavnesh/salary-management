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
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, md: 3 }, minHeight: { xs: 52, md: 64 } }}>
        <Typography
          variant="h6"
          component="div"
          noWrap
          sx={{
            fontWeight: 700,
            color: '#111827',
            letterSpacing: '-0.025em',
            fontSize: { xs: '1rem', md: '1.25rem' },
            minWidth: 0,
            flexShrink: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
            ACME Salary
          </Box>
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            ACME Salary Management
          </Box>
        </Typography>
        <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
          <Button
            component={RouterLink}
            to="/"
            onClick={() => navigate('/')}
            sx={{
              color: isDirectory ? '#2563EB' : '#4B5563',
              fontWeight: isDirectory ? 600 : 500,
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
              px: { xs: 1, md: 2 },
              minWidth: 0,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              position: 'relative',
              '&::after': isDirectory ? {
                content: '""',
                position: 'absolute',
                bottom: { xs: -8, md: -13 },
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
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
              px: { xs: 1, md: 2 },
              minWidth: 0,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              position: 'relative',
              '&::after': isInsights ? {
                content: '""',
                position: 'absolute',
                bottom: { xs: -8, md: -13 },
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
