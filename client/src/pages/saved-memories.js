import React, { useEffect, useState } from "react";
import axios from "axios";
import { useGetUserID } from "../hooks/useGetUserID";
import { Box, Card, CardMedia, CardContent, Typography, CircularProgress } from "@mui/material";

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
         // --- FIX IS HERE --- Using CSS Grid directly
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Responsive columns
          gap: 3, // Space between grid items
          maxWidth: 1200,
          marginX: 'auto' // Center the grid container
        }}>
          {savedMemories.map((memory) => (
            <Card key={memory._id} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: 3, height: 400 }}>
              <CardMedia
                component="img"
                height="200"
                image={memory.imageURL}
                alt={memory.name}
                sx={{ objectFit: 'cover' }}
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
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};