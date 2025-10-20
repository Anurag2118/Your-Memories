import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

// Material-UI Components
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export const Navbar = () => {
  const [cookies, setCookies] = useCookies(["access_token"]);
  const navigate = useNavigate();

  const logout = () => {
    setCookies("access_token", "");
    window.localStorage.clear();
    navigate("/auth");
  };

  return (
    // Box component provides a wrapper
    <Box sx={{ flexGrow: 1 }}>
      {/* AppBar is the main navigation bar container */}
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        {/* Toolbar helps in structuring the items inside the AppBar */}
        <Toolbar>
          {/* Title of the App */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
          >
            Your Memories
          </Typography>

          {/* Navigation Links */}
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/create-memory">
            Create Memory
          </Button>

          {/* Conditional Rendering for Login/Logout */}
          {!cookies.access_token ? (
            <Button color="inherit" component={Link} to="/auth">
              Login/Register
            </Button>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/saved-memories">
                Saved Memories
              </Button>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};