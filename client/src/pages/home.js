import { useEffect, useState } from "react";
import axios from "axios";
import { useGetUserID } from "../hooks/useGetUserID";
import { useCookies } from "react-cookie";

export const Home = () => {
  const [memories, setMemories] = useState([]);
  // Initialize savedMemories as an empty array
  const [savedMemories, setSavedMemories] = useState([]);
  const [cookies, _] = useCookies(["access_token"]);
  const userID = useGetUserID(); // Hook to get the user ID

  // Effect to fetch initial memories and saved memories
  useEffect(() => {
    // Function to fetch all memories
    const fetchMemories = async () => {
      try {
        const response = await axios.get("http://localhost:3001/memories");
        setMemories(response.data);
        console.log("Memories fetched successfully.");
      } catch (err) {
        console.error("Error fetching memories:", err);
      }
    };

    // Function to fetch the IDs of memories saved by the current user
    const fetchSavedMemories = async () => {
      if (!userID) {
          console.log("userID not available yet, skipping fetchSavedMemories");
          // Ensure savedMemories is empty if no user is logged in
          setSavedMemories([]);
          return;
      }
      try {
        console.log("Attempting to fetch saved memories for userID:", userID);
        // This GET endpoint should return an object like { savedMemories: ["id1", "id2"] }
        const response = await axios.get(
          `http://localhost:3001/memories/savedMemories/ids/${userID}`
        );
        console.log("Fetched saved memories response:", response.data);
        // Expecting response.data.savedMemories to be an array. Default to empty array if not.
        // This handles the initial load of saved memory IDs
        setSavedMemories(response.data.savedMemories || []);
        console.log("Saved memories state initialized from fetch.");
      } catch (err) {
        console.error("Error fetching saved memories:", err);
        // In case of error, ensure savedMemories is at least an empty array
        setSavedMemories([]);
      }
    };

    // Fetch all memories on component mount
    fetchMemories();

    // Fetch saved memories only if the user is logged in (token and userID available)
    // This will run on mount and whenever the access_token or userID changes
    if (cookies.access_token && userID) {
        fetchSavedMemories();
    } else {
        // If not logged in, ensure savedMemories is an empty array
        setSavedMemories([]);
    }
  }, [cookies.access_token, userID]); // Dependencies: re-run if token or userID changes

  // Function to handle saving a memory
  const saveMemory = async (memoryID) => {
    console.log("Save button clicked for memoryID:", memoryID);
    console.log("Current userID:", userID);
    console.log("Current access_token:", cookies.access_token);

    // Prevent saving if user is not logged in or token is missing
    if (!userID || !cookies.access_token) {
        console.log("Cannot save: User not logged in or token missing.");
        // You might want to show a UI message to the user here, e.g., "Please log in to save memories."
        return;
    }

    try {
      console.log("Attempting to send PUT request to save memory...");
      // This PUT endpoint should expect { memoryID: "...", userID: "..." }
      // and should *return* the *updated* list of saved memory IDs for the user.
      const response = await axios.put(
        "http://localhost:3001/memories", // Make sure this is the correct endpoint for saving
        {
          memoryID,
          userID,
        },
        {
          headers: { authorization: cookies.access_token }, // Sending the auth token
        }
      );

      console.log("Response from PUT /memories:", response.data);

      // **IMPORTANT:** We expect response.data to contain the *updated* list of saved memory IDs
      // e.g., { message: "Saved!", savedMemories: ["id1", "id2", "newlySavedId"] }
      if (response.data && Array.isArray(response.data.savedMemories)) {
          // Update the savedMemories state with the latest list from the backend
          setSavedMemories(response.data.savedMemories);
          console.log("Saved memories state updated successfully from API response.");
      } else {
          // Log an error if the backend response format is unexpected
          console.error("API response did not contain expected 'savedMemories' array:", response.data);
          // Optionally, re-fetch the saved memories after a short delay
          // setTimeout(fetchSavedMemories, 1000); // Consider adding a delay and error handling
      }

    } catch (err) {
      console.error("Error saving memory:", err);
      // Log detailed error info if available
      if (err.response) {
          console.error("Server responded with error status:", err.response.status);
          console.error("Server error data:", err.response.data);
      } else if (err.request) {
          console.error("No response received from server.");
      } else {
          console.error("Error setting up request:", err.message);
      }
      // You might want to show an error message to the user on the UI
    }
  };

  // Helper function to check if a memory ID is in the savedMemories array
  // Ensures savedMemories is an array before calling .includes()
  const isMemorySaved = (id) => {
       // console.log(`Checking if ${id} is in`, savedMemories); // Uncomment for verbose check
       return Array.isArray(savedMemories) && savedMemories.includes(id);
  };


  return (
    <div>
      <h1>Memories</h1>
      <ul>
        {/* Map through the list of all memories */}
        {memories.map((memory) => (
          <li key={memory._id}>
            <div>
              <h2>{memory.name}</h2>
              {/* Conditionally render the Save button only if the user is logged in (userID exists) */}
              {userID ? (
                 <button
                   onClick={() => saveMemory(memory._id)}
                   // Button is disabled if the memory ID is found in the savedMemories state
                   disabled={isMemorySaved(memory._id)}
                 >
                   {/* Button text changes based on whether the memory is saved */}
                   {isMemorySaved(memory._id) ? "Saved" : "Save"}
                 </button>
              ) : (
                  // Show a message or nothing if the user is not logged in
                  <p>Log in to save</p>
              )}
            </div>
            <div className="descriptions">
              {/* Map through descriptions if they exist and are an array */}
              {memory.descriptions && Array.isArray(memory.descriptions) && memory.descriptions.map((desc, i) => (
                <p key={i}>{desc}</p>
              ))}
            </div>
            <img src={memory.imageURL} alt={memory.name} />
            <p>Time Spent: {memory.timeSpent}</p>
          </li>
        ))}
      </ul>

      {/* Optional: Section to display saved memories - uncomment and adapt as needed */}
       {/* <h2>Saved Memories</h2>
       {Array.isArray(savedMemories) && savedMemories.length > 0 ? (
           <ul>
               {memories
                   // Filter all memories to find saved ones based on the savedMemories IDs
                   .filter(memory => isMemorySaved(memory._id))
                   .map(savedMemory => (
                       <li key={savedMemory._id}>
                           <h3>{savedMemory.name}</h3>
                           {/* Add other details you want to show for saved memories, e.g.: }
                           {/* <p>{savedMemory.timeSpent}</p> }
                           {/* <img src={savedMemory.imageUrl} alt={savedMemory.name} width="100" /> }
                       </li>
                   ))}
           </ul>
       ) : (
           <p>{userID ? "No memories saved yet." : "Log in to see saved memories."}</p>
       )} */}
    </div>
  );
};