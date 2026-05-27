import React, { useEffect, useState } from "react";
import axios from "axios";
import { useGetUserID } from "../hooks/useGetUserID";
import { useCookies } from "react-cookie";
import { 
  Box, Card, CardMedia, CardContent, CardActions, Button, Typography, CircularProgress,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, Divider, Paper
} from "@mui/material";
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Home = () => {
  const [memories, setMemories] = useState([]);
  const [savedMemories, setSavedMemories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [editImage, setEditImage] = useState(null);

  const [cookies, _] = useCookies(["access_token"]);
  const userID = useGetUserID();
  
  const isLoggedIn = Boolean(cookies.access_token && userID);

  const fetchData = async () => {
    try {
      const memoriesResponse = await axios.get(`${BACKEND_URL}/memories`);
      setMemories(memoriesResponse.data);

      if (isLoggedIn) {
        const savedResponse = await axios.get(
          `${BACKEND_URL}/memories/savedMemories/ids/${userID}`
        );
        setSavedMemories(savedResponse.data.savedMemories || []);

        setRecLoading(true);
        try {
          const recResponse = await axios.get(`${BACKEND_URL}/memories/recommendations`, {
            headers: { authorization: `Bearer ${cookies.access_token}` }
          });
          setRecommendations(recResponse.data);
        } catch (recErr) {
          console.error(recErr);
        } finally {
          setRecLoading(false);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userID, cookies.access_token]);

  const toggleSaveMemory = async (memoryID) => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/memories`,
        { memoryID, userID },
        { headers: { authorization: `Bearer ${cookies.access_token}` } }
      );
      setSavedMemories(response.data.savedMemories);
      
      setRecLoading(true);
      const recResponse = await axios.get(`${BACKEND_URL}/memories/recommendations`, {
        headers: { authorization: `Bearer ${cookies.access_token}` }
      });
      setRecommendations(recResponse.data);
      setRecLoading(false);
      
    } catch (err) {
      console.error(err);
      setRecLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this memory?")) {
      try {
        await axios.delete(`${BACKEND_URL}/memories/${id}`, {
          headers: { authorization: `Bearer ${cookies.access_token}` }
        });
        setMemories(memories.filter((m) => m._id !== id));
        setRecommendations(recommendations.filter((m) => m._id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete memory.");
      }
    }
  };

  const openEditDialog = (memory) => {
    setCurrentEdit({ 
      ...memory, 
      descriptionsStr: memory.descriptions.join("\n") 
    });
    setEditImage(null);
    setEditDialogOpen(true);
  };

  const handleEditChange = (e) => {
    setCurrentEdit({ ...currentEdit, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    const formData = new FormData();
    formData.append("name", currentEdit.name);
    formData.append("timeSpent", currentEdit.timeSpent);
    formData.append("budget", currentEdit.budget);
    formData.append("category", currentEdit.category);
    formData.append("descriptions", JSON.stringify(currentEdit.descriptionsStr.split("\n")));
    
    if (editImage) {
      formData.append("image", editImage);
    }

    try {
      await axios.put(`${BACKEND_URL}/memories/edit/${currentEdit._id}`, formData, {
        headers: { 
          authorization: `Bearer ${cookies.access_token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setEditDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to update memory.");
    }
  };

  const isMemorySaved = (id) => savedMemories.includes(id);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ paddingX: { xs: 2, sm: 4 }, paddingY: 5, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      
      {/* AI Recommendation Section */}
      <Box sx={{ maxWidth: 1200, marginX: 'auto', marginBottom: 6 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 1, color: '#1976d2' }}>
          <AutoAwesomeIcon /> Recommended For You
        </Typography>
        
        {!isLoggedIn ? (
          <Paper elevation={1} sx={{ padding: 4, textAlign: 'center', backgroundColor: '#e3f2fd', borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary">
              Login to view personalized AI recommendations!
            </Typography>
          </Paper>
        ) : recLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', paddingY: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : recommendations.length > 0 ? (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 3
            }}>
              {recommendations.map((memory) => {
                const ownerID = typeof memory.userOwner === 'object' && memory.userOwner ? memory.userOwner._id : memory.userOwner;
                const authorName = typeof memory.userOwner === 'object' && memory.userOwner ? memory.userOwner.username : "unknown";

                return (
                  <Card key={memory._id} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: 3, height: 450, backgroundColor: '#ffffff', border: '1px solid #e3f2fd' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={memory.imageURL}
                      alt={memory.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
                      <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {memory.name}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#1976d2', fontWeight: 'bold' }}>
                        By @{authorName}
                      </Typography>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        {memory.category} | Budget: ₹{memory.budget} | {memory.timeSpent}
                      </Typography>
                      {memory.descriptions.map((desc, index) => (
                        <Typography key={index} variant="body2" color="text.secondary">
                          • {desc}
                        </Typography>
                      ))}
                    </CardContent>
                    <CardActions sx={{ paddingX: 2, paddingBottom: 2, display: 'flex', justifyContent: 'space-between' }}>
                    {!isLoggedIn ? (
                      <Typography variant="caption" color="text.secondary">
                        Login to save
                      </Typography>
                    ) : userID !== ownerID ? (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => toggleSaveMemory(memory._id)}
                        startIcon={isMemorySaved(memory._id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                      >
                        {isMemorySaved(memory._id) ? "Saved" : "Save"}
                      </Button>
                    ) : (
                      <Box />
                    )}
                    </CardActions>
                  </Card>
                );
              })}
            </Box>
          ) : savedMemories.length > 0 ? (
            <Paper elevation={1} sx={{ padding: 4, textAlign: 'center', backgroundColor: '#e3f2fd', borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary">
                You have explored everything. No new memories left to recommend right now. Check back later.
              </Typography>
            </Paper>
          ) : (
            <Paper elevation={1} sx={{ padding: 4, textAlign: 'center', backgroundColor: '#e3f2fd', borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary">
                Save memories from the discover feed below to get personalized AI recommendations here!
              </Typography>
            </Paper>
          )}
          <Divider sx={{ marginTop: 5 }} />
      </Box>

      {/* Discover Memories Section */}
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', marginBottom: 4 }}>
        Discover Memories
      </Typography>
      
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 3,
        maxWidth: 1200,
        marginX: 'auto'
      }}>
        {memories.map((memory) => {
          const ownerID = typeof memory.userOwner === 'object' && memory.userOwner ? memory.userOwner._id : memory.userOwner;
          const authorName = typeof memory.userOwner === 'object' && memory.userOwner ? memory.userOwner.username : "unknown";
          
          return (
            <Card key={memory._id} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: 3, height: 450 }}>
              <CardMedia
                component="img"
                height="200"
                image={memory.imageURL}
                alt={memory.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
                <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {memory.name}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#757575', fontStyle: 'italic' }}>
                  By @{authorName}
                </Typography>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {memory.category} | Budget: ₹{memory.budget} | {memory.timeSpent}
                </Typography>
                {memory.descriptions.map((desc, index) => (
                  <Typography key={index} variant="body2" color="text.secondary">
                    • {desc}
                  </Typography>
                ))}
              </CardContent>
              <CardActions sx={{ paddingX: 2, paddingBottom: 2, display: 'flex', justifyContent: 'space-between' }}>
                {!isLoggedIn ? (
                  <Typography variant="caption" color="text.secondary">
                    Login to save
                  </Typography>
                ) : userID !== ownerID ? (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => toggleSaveMemory(memory._id)}
                    startIcon={isMemorySaved(memory._id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  >
                    {isMemorySaved(memory._id) ? "Saved" : "Save"}
                  </Button>
                ) : (
                  <Box />
                )}
                
                {isLoggedIn && userID === ownerID && (
                  <Box>
                    <IconButton color="primary" onClick={() => openEditDialog(memory)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(memory._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </CardActions>
            </Card>
          );
        })}
      </Box>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Memory</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {currentEdit && (
            <>
              <TextField label="Name" name="name" value={currentEdit.name} onChange={handleEditChange} fullWidth />
              <TextField label="Time Spent" name="timeSpent" value={currentEdit.timeSpent} onChange={handleEditChange} fullWidth />
              <TextField label="Budget (₹)" name="budget" type="number" value={currentEdit.budget} onChange={handleEditChange} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select name="category" value={currentEdit.category} label="Category" onChange={handleEditChange}>
                  <MenuItem value="Mountain">Mountain</MenuItem>
                  <MenuItem value="Beach">Beach</MenuItem>
                  <MenuItem value="City/Urban">City/Urban</MenuItem>
                  <MenuItem value="Religious/Spiritual">Religious/Spiritual</MenuItem>
                  <MenuItem value="Adventure">Adventure</MenuItem>
                  <MenuItem value="Desert">Desert</MenuItem>
                  <MenuItem value="General">General/Other</MenuItem>
                </Select>
              </FormControl>
              <TextField 
                label="Descriptions (One per line)" 
                name="descriptionsStr" 
                value={currentEdit.descriptionsStr} 
                onChange={handleEditChange} 
                multiline 
                rows={3} 
                fullWidth 
              />
              <Button variant="outlined" component="label">
                Upload New Image (Optional)
                <input type="file" hidden accept="image/*" onChange={(e) => setEditImage(e.target.files[0])} />
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};