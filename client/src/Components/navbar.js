import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

import { AppBar, Box, Toolbar, Typography, Button, IconButton, Menu, MenuItem, useMediaQuery } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';

export const Navbar = () => {
  const [cookies, setCookies] = useCookies(["access_token"]);
  const navigate = useNavigate();

  // Check if the screen width is less than or equal to 690px
  const isMobile = useMediaQuery('(max-width:690px)');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logout = () => {
    handleClose();
    setCookies("access_token", "");
    window.localStorage.clear();
    navigate("/auth");
  };

  const NavLink = ({ to, label, onClick }) => (
    <Button
      color="inherit"
      component={onClick ? Button : Link}
      to={to}
      onClick={onClick}
      sx={{ marginX: 1 }}
    >
      {label}
    </Button>
  );

  const MobileMenuItem = ({ to, label, onClick }) => {
    const navigateAndClose = () => {
      if (to) navigate(to);
      if (onClick) onClick();
      handleClose();
    };

    return (
      <MenuItem onClick={navigateAndClose}>
        {label}
      </MenuItem>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={3} sx={{ backgroundColor: "#212121" }}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
          >
            Your Memories
          </Typography>

          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MobileMenuItem to="/" label="Home" />
                <MobileMenuItem to="/create-memory" label="Create Memory" />
                {!cookies.access_token ? (
                  <MobileMenuItem to="/auth" label="Login/Register" />
                ) : (
                  [
                    <MobileMenuItem key="saved" to="/saved-memories" label="Saved Memories" />,
                    <MobileMenuItem key="logout" label="Logout" onClick={logout} />
                  ]
                )}
              </Menu>
            </>
          ) : (
            <Box>
              <NavLink to="/" label="Home" />
              <NavLink to="/create-memory" label="Create Memory" />
              {!cookies.access_token ? (
                <NavLink to="/auth" label="Login/Register" />
              ) : (
                <>
                  <NavLink to="/saved-memories" label="Saved Memories" />
                  <NavLink label="Logout" onClick={logout} />
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};