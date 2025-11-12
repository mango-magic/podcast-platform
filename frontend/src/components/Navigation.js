import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Mic as MicIcon,
  LibraryBooks as LibraryIcon,
  People as PeopleIcon,
  Movie as MovieIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  AutoAwesome as InspirationIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isGuestMode } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleMenuClose();
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Podcasts', path: '/podcasts', icon: <LibraryIcon /> },
    { label: 'Episodes', path: '/episodes', icon: <MicIcon /> },
    { label: 'Guests', path: '/guests', icon: <PeopleIcon /> },
    { label: 'Clips', path: '/clips', icon: <MovieIcon /> },
    { label: 'Distributions', path: '/distributions', icon: <ShareIcon /> },
    { label: 'Inspiration', path: '/inspiration', icon: <InspirationIcon /> },
  ];

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        background: 'rgba(10, 14, 39, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
        boxShadow: '0 4px 30px rgba(0, 212, 255, 0.1)',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Typography
          variant="h5"
          component="div"
          sx={{ 
            flexGrow: 0, 
            mr: 4,
            fontWeight: 800,
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #00d4ff 0%, #ff00ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
          onClick={() => navigate('/')}
        >
          🎙️ MangoMagic
        </Typography>

        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  color: isActive ? '#00d4ff' : 'rgba(255, 255, 255, 0.7)',
                  backgroundColor: isActive 
                    ? 'rgba(0, 212, 255, 0.15)' 
                    : 'transparent',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: isActive 
                    ? '1px solid rgba(0, 212, 255, 0.3)' 
                    : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    color: '#00d4ff',
                    transform: 'translateY(-2px)',
                    borderColor: 'rgba(0, 212, 255, 0.3)',
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isGuestMode && (
            <Box
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: 2,
                background: 'rgba(255, 0, 255, 0.15)',
                border: '1px solid rgba(255, 0, 255, 0.3)',
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#ff00ff',
                  fontWeight: 600,
                }}
              >
                Guest Mode
              </Typography>
            </Box>
          )}
          
          <IconButton
            onClick={() => navigate('/record')}
            sx={{ 
              color: '#00d4ff',
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              transition: 'all 0.3s',
              '&:hover': {
                backgroundColor: 'rgba(0, 212, 255, 0.2)',
                transform: 'scale(1.1)',
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
              },
            }}
          >
            <MicIcon />
          </IconButton>

          <IconButton 
            onClick={handleMenuOpen} 
            sx={{ 
              color: 'white',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            {user?.profilePictureUrl ? (
              <Avatar 
                src={user.profilePictureUrl} 
                sx={{ 
                  width: 36, 
                  height: 36,
                  border: '2px solid rgba(0, 212, 255, 0.5)',
                  boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)',
                }} 
              />
            ) : (
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  background: 'linear-gradient(135deg, #00d4ff 0%, #ff00ff 100%)',
                  border: '2px solid rgba(0, 212, 255, 0.5)',
                  boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            )}
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                background: 'rgba(15, 20, 40, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: 2,
                mt: 1,
                minWidth: 200,
                boxShadow: '0 8px 32px rgba(0, 212, 255, 0.2)',
              },
            }}
          >
            <MenuItem disabled sx={{ py: 2 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#00d4ff' }}>
                  {user?.name || 'Guest User'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {user?.email || 'guest@mangomagic.com'}
                </Typography>
              </Box>
            </MenuItem>
            <Divider sx={{ borderColor: 'rgba(0, 212, 255, 0.2)' }} />
            <MenuItem 
              onClick={() => { navigate('/settings'); handleMenuClose(); }}
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  color: '#00d4ff',
                },
              }}
            >
              <SettingsIcon sx={{ mr: 1.5, fontSize: 20 }} />
              Settings
            </MenuItem>
            <MenuItem 
              onClick={handleLogout}
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 51, 102, 0.1)',
                  color: '#ff3366',
                },
              }}
            >
              <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation;
