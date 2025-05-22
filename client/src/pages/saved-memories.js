import { useEffect, useState } from "react";
import axios from "axios";
import { useGetUserID } from "../hooks/useGetUserID";

export const SavedMemories = () => {
  const [savedMemories, setSavedMemories] = useState([]);
  const userID = useGetUserID();

  useEffect(() => {
    const fetchSavedMemories = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/memories/savedMemories/${userID}`);
        setSavedMemories(response.data.savedMemories);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSavedMemories();
  }, []);

  return (
    <div>
      <h1>Saved Memories</h1>
      <ul>
        {savedMemories.map((memory) => (
          <li key={memory._id}>
            <h2>{memory.name}</h2>
            <div className="descriptions">
              {memory.descriptions.map((desc, i) => (
                <p key={i}>{desc}</p>
              ))}
            </div>
            <img src={memory.imageURL} alt={memory.name} />
            <p>Time Spent: {memory.timeSpent}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
