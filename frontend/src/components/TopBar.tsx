import {
  AppBar,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function TopBar() {
  const navigate = useNavigate();
  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ACME Salary Management
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          color="inherit"
          onClick={() => navigate('/')}
        >
          Directory
        </Button>
        <Button
          component={RouterLink}
          to="/insights"
          color="inherit"
          onClick={() => navigate('/insights')}
        >
          Insights
        </Button>
      </Toolbar>
    </AppBar>
  );
}
