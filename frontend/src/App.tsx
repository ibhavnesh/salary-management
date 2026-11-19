import { Box, CssBaseline, ThemeProvider, Container, createTheme } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import EmployeesPage from './pages/Employees';
import InsightsPage from './pages/Insights';

const theme = createTheme({
  palette: {
    primary: { main: '#2563EB' },
    background: { default: '#F6F7F9', paper: '#FFFFFF' },
    text: { primary: '#111827', secondary: '#4B5563' },
    divider: '#E5E7EB',
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: 14,
  },
  shape: { borderRadius: 10 },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #E5E7EB',
          borderRadius: 10,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8, fontWeight: 500 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: '#E5E7EB', padding: '12px 16px' },
        head: {
          backgroundColor: '#F9FAFB',
          fontWeight: 600,
          color: '#374151',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
        <TopBar />
        <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
          <Routes>
            <Route path="/" element={<EmployeesPage />} />
            <Route path="/insights" element={<InsightsPage />} />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
