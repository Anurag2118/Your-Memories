import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

// Material-UI Components
import { Box, Button, TextField, Typography, Paper, IconButton } from "@mui/material";
// Material-UI Icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const CreateMemory = () => {
  const [cookies, _] = useCookies(["access_token"]);
  const navigate = useNavigate();

  const [memory, setMemory] = useState({
    name: "",
    descriptions: [""], // Start with one empty description field
    imageURL: "",
    timeSpent: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMemory({ ...memory, [name]: value });
  };

  const handleDescriptionChange = (event, idx) => {
    const { value } = event.target;
    const descriptions = [...memory.descriptions];
    descriptions[idx] = value;
    setMemory({ ...memory, descriptions });
  };

  const addDescription = () => {
    setMemory({ ...memory, descriptions: [...memory.descriptions, ""] });
  };
  
  // New function to remove a description field
  const removeDescription = (idx) => {
    const descriptions = [...memory.descriptions];
    descriptions.splice(idx, 1); // remove one element at index idx
    setMemory({ ...memory, descriptions });
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(
        `${BACKEND_URL}/memories`,
        { ...memory },
        {
          headers: { authorization: `Bearer ${cookies.access_token}` },
        }
      );
      alert("Memory Created!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to create memory. Please check console for details.");
    }
  };

  return (
    // This main Box centers everything
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingY: 4, // Add some vertical padding
      }}
    >
      {/* Paper gives the card-like appearance with a shadow */}
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: "600px", // Make the form a bit wider
        }}
      >
        <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create a New Memory
          </Typography>

          <TextField label="Name / Title" name="name" required fullWidth value={memory.name} onChange={handleChange} />
          <TextField label="Image URL" name="imageURL" required fullWidth value={memory.imageURL} onChange={handleChange} />
          <TextField label="Time Spent (e.g., '2 Hours', '3 Days')" name="timeSpent" required fullWidth value={memory.timeSpent} onChange={handleChange} />

          <Typography variant="h6">Descriptions</Typography>
          {memory.descriptions.map((description, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <TextField
                label={`Description #${idx + 1}`}
                fullWidth
                multiline // Allows multiple lines of text
                rows={2}   // Starts with a height of 2 lines
                value={description}
                onChange={(event) => handleDescriptionChange(event, idx)}
              />
              <IconButton onClick={() => removeDescription(idx)} color="error">
                <RemoveCircleOutlineIcon />
              </IconButton>
            </Box>
          ))}
          
          <Button onClick={addDescription} startIcon={<AddCircleOutlineIcon />} variant="outlined">
            Add Description
          </Button>

          <Button type="submit" variant="contained" size="large" sx={{ marginTop: 2 }}>
            Create Memory
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};