import React, { useEffect, useState } from "react";
import axios from "axios";
import { useGetUserID } from "../hooks/useGetUserID";
import { Box, Grid, Card, CardMedia, CardContent, Typography, CircularProgress } from "@mui/material";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const SavedMemories = () => {
  const [savedMemories, setSavedMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const userID = useGetUserID();

  useEffect(() => {
    const fetchSavedMemories = async () => {
      if (!userID) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `${BACKEND_URL}/memories/savedMemories/${userID}`
        );
        setSavedMemories(response.data.savedMemories || []);
      } catch (err) {
        console.error("Error fetching saved memories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedMemories();
  }, [userID]);

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
        Your Saved Memories
      </Typography>

      {savedMemories.length === 0 ? (
        <Typography variant="h6" align="center" color="text.secondary">
          You haven't saved any memories yet.
        </Typography>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {savedMemories.map((memory) => (
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
                <CardContent sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    {memory.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {memory.descriptions[0]}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};