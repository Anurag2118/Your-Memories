import React, { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

// Material-UI Components
import { Box, Button, TextField, Typography, Paper } from "@mui/material";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Reusable Form Component with MUI
const Form = ({
  label,
  username,
  setUsername,
  password,
  setPassword,
  onSubmit,
}) => {
  return (
    // Box is a flexible container from MUI
    <Box
      component="form" // Renders as a <form> tag
      onSubmit={onSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2, // Adds space between form elements
        width: "100%",
      }}
    >
      <Typography variant="h4" component="h2" gutterBottom>
        {label}
      </Typography>
      <TextField
        label="Username"
        variant="outlined"
        required
        fullWidth
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        required
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" variant="contained" size="large" fullWidth>
        {label}
      </Button>
    </Box>
  );
};

// Login Component (Logic is the same, UI is changed)
const Login = () => {
  const [_, setCookies] = useCookies(["access_token"]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/login`, {
        username,
        password,
      });

      if (response.data.token) {
        setCookies("access_token", response.data.token);
        window.localStorage.setItem("userID", response.data.userID);
        navigate("/");
      }

    } catch (err) {
      setCookies("access_token", "");
      window.localStorage.removeItem("userID");
      alert(err.response.data.message);
    }
  };
  
  return (
    <Form
      label="Login"
      username={username}
      setUsername={setUsername}
      password={password}
      setPassword={setPassword}
      onSubmit={onSubmit}
    />
  );
};

// Register Component (Logic is the same, UI is changed)
const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/auth/register`, {
        username,
        password,
      });
      alert("Registration Completed! Now you can log in.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration failed. User may already exist.");
    }
  };

  return (
    <Form
      label="Register"
      username={username}
      setUsername={setUsername}
      password={password}
      setPassword={setPassword}
      onSubmit={onSubmit}
    />
  );
};

// Main Auth Page Component
export const Auth = () => {
  return (
    // This main Box centers everything
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 64px)", // Full viewport height minus navbar height
      }}
    >
      {/* Paper gives the card-like appearance with a shadow */}
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          width: '100%',
          maxWidth: "400px", // Limits the form width on larger screens
        }}
      >
        <Login />
        <Register />
      </Paper>
    </Box>
  );
};