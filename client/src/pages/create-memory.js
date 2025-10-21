import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Box, Button, TextField, Typography, Paper, IconButton } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import BackupIcon from '@mui/icons-material/Backup';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const CreateMemory = () => {
  const [cookies, _] = useCookies(["access_token"]);
  const navigate = useNavigate();

  const [memory, setMemory] = useState({
    name: "",
    descriptions: [""],
    timeSpent: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

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
  
  const removeDescription = (idx) => {
    const descriptions = [...memory.descriptions];
    descriptions.splice(idx, 1);
    setMemory({ ...memory, descriptions });
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append("name", memory.name);
    formData.append("descriptions", JSON.stringify(memory.descriptions));
    formData.append("timeSpent", memory.timeSpent);
    formData.append("image", image);

    try {
      await axios.post(
        `${BACKEND_URL}/memories`,
        formData,
        {
          headers: { 
            authorization: `Bearer ${cookies.access_token}`,
            "Content-Type": "multipart/form-data",
          },
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
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingY: 4,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: "600px",
        }}
      >
        <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create a New Memory
          </Typography>

          <TextField label="Name / Title" name="name" required fullWidth value={memory.name} onChange={handleChange} />
          <TextField label="Time Spent (e.g., '2 Hours', '3 Days')" name="timeSpent" required fullWidth value={memory.timeSpent} onChange={handleChange} />
          
          <Box sx={{ border: '2px dashed grey', borderRadius: 2, padding: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<BackupIcon />}
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </Button>
            {imagePreview && (
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="caption">Image Preview:</Typography>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: 'auto', marginTop: '8px' }} />
              </Box>
            )}
          </Box>

          <Typography variant="h6">Descriptions</Typography>
          {memory.descriptions.map((description, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <TextField
                label={`Description #${idx + 1}`}
                fullWidth
                multiline
                rows={2}
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