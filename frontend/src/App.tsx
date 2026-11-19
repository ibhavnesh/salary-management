import { Box, CssBaseline, Toolbar } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import EmployeesPage from './pages/Employees';
import InsightsPage from './pages/Insights';

export default function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <TopBar />
      <Box component="main" sx={{ flexGrow: 1, pt: 3 }}>
        <Toolbar />
        <Routes>
          <Route path="/" element={<EmployeesPage />} />
          <Route path="/insights" element={<InsightsPage />} />
        </Routes>
      </Box>
    </Box>
  );
}
