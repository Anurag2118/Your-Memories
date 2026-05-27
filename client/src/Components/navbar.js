import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

export const Navbar = () => {
  const [cookies, setCookies] = useCookies(["access_token"]);
  const navigate = useNavigate();

  const logout = () => {
    setCookies("access_token", "");
    window.localStorage.removeItem("userID");
    navigate("/auth");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#212121' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            Your Memories
          </Link>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} to="/">
            HOME
          </Button>
          
          {cookies.access_token ? (
            <>
              <Button color="inherit" component={Link} to="/create-memory">
                CREATE MEMORY
              </Button>
              <Button color="inherit" component={Link} to="/saved-memories">
                SAVED MEMORIES
              </Button>
              <Button color="inherit" onClick={logout}>
                LOGOUT
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/auth">
              LOGIN / REGISTER
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};