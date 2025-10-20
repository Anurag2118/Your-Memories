import React, { useEffect, useState } from "react";
import axios from "axios";
import { useGetUserID } from "../hooks/useGetUserID";
import { useCookies } from "react-cookie";
import { Box, Grid, Card, CardMedia, CardContent, CardActions, Button, Typography, CircularProgress } from "@mui/material";
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Home = () => {
  const [memories, setMemories] = useState([]);
  const [savedMemories, setSavedMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cookies, _] = useCookies(["access_token"]);
  const userID = useGetUserID();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const memoriesResponse = await axios.get(`${BACKEND_URL}/memories`);
        setMemories(memoriesResponse.data);

        if (cookies.access_token && userID) {
          const savedResponse = await axios.get(
            `${BACKEND_URL}/memories/savedMemories/ids/${userID}`
          );
          setSavedMemories(savedResponse.data.savedMemories || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

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
    } catch (err) {
      console.error("Error toggling save state:", err);
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
    <Box sx={{ paddingX: { xs: 2, sm: 4 }, paddingY: 5, backgroundColor: '#f4f6f8' }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', marginBottom: 4 }}>
        Discover Memories
      </Typography>
      
      <Grid container spacing={3} justifyContent="center">
        {memories.map((memory) => (
          <Grid item key={memory._id} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ height: 360, display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: 3 }}>
              <CardMedia
                component="img"
                image={memory.imageURL}
                alt={memory.name}
                sx={{ 
                  height: 200, // Fixed height for the image area
                  objectFit: 'cover' 
                }}
              />
              <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
                <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  {memory.name}
                </Typography>
                {memory.descriptions.map((desc, index) => (
                  <Typography key={index} variant="body2" color="text.secondary">
                    • {desc}
                  </Typography>
                ))}

              </CardContent>
              <CardActions sx={{ paddingX: 2, paddingBottom: 2 }}>
                {userID ? (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => toggleSaveMemory(memory._id)}
                    startIcon={isMemorySaved(memory._id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  >
                    {isMemorySaved(memory._id) ? "Saved" : "Save"}
                  </Button>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Login to save
                  </Typography>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};