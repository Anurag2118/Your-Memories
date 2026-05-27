import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { 
  AppBar, Toolbar, Typography, Box, Button, IconButton, Menu, MenuItem 
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export const Navbar = () => {
  const [cookies, setCookies] = useCookies(["access_token"]);
  const navigate = useNavigate();
  const isLoggedIn = Boolean(cookies.access_token && window.localStorage.getItem("userID"));

  // Hamburger Menu State
  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleNavClick = (path) => {
    handleCloseNavMenu();
    navigate(path);
  };

  const logout = () => {
    handleCloseNavMenu();
    setCookies("access_token", "");
    window.localStorage.removeItem("userID");
    window.localStorage.clear();
    navigate("/auth");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1a1a1a" }}>
      <Toolbar>
        <Typography
          variant="h5"
          noWrap
          component={Link}
          to="/"
          sx={{
            mr: 2,
            display: 'flex',
            flexGrow: { xs: 1, md: 0 },
            fontWeight: 700,
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          Your Memories
        </Typography>

        {/* HAMBURGER MENU (on Mobile devices) */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorElNav}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            <MenuItem onClick={() => handleNavClick('/')}>
              <Typography textAlign="center" fontWeight="bold">HOME</Typography>
            </MenuItem>
            
            {!isLoggedIn ? (
              <MenuItem onClick={() => handleNavClick('/auth')}>
                <Typography textAlign="center" fontWeight="bold">LOGIN / REGISTER</Typography>
              </MenuItem>
            ) : (
              [
                <MenuItem key="create" onClick={() => handleNavClick('/create-memory')}>
                  <Typography textAlign="center" fontWeight="bold">CREATE MEMORY</Typography>
                </MenuItem>,
                <MenuItem key="saved" onClick={() => handleNavClick('/saved-memories')}>
                  <Typography textAlign="center" fontWeight="bold">SAVED MEMORIES</Typography>
                </MenuItem>,
                <MenuItem key="logout" onClick={logout}>
                  <Typography textAlign="center" color="error" fontWeight="bold">LOGOUT</Typography>
                </MenuItem>
              ]
            )}
          </Menu>
        </Box>

        {/* Desktop View */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', gap: 2 }}>
          <Button component={Link} to="/" sx={{ color: 'white', display: 'block' }}>
            HOME
          </Button>
          
          {!isLoggedIn ? (
            <Button component={Link} to="/auth" sx={{ color: 'white', display: 'block' }}>
              LOGIN / REGISTER
            </Button>
          ) : (
            <>
              <Button component={Link} to="/create-memory" sx={{ color: 'white', display: 'block' }}>
                CREATE MEMORY
              </Button>
              <Button component={Link} to="/saved-memories" sx={{ color: 'white', display: 'block' }}>
                SAVED MEMORIES
              </Button>
              <Button 
                onClick={logout} 
                sx={{ 
                  color: 'white', 
                  backgroundColor: '#d32f2f', 
                  '&:hover': { backgroundColor: '#b71c1c' },
                  marginLeft: 1
                }}
              >
                LOGOUT
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};