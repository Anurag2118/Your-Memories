import { useState } from "react";
import axios from "axios";
import { useGetUserID } from "../hooks/useGetUserID"; // Still used for initial state, but can be removed if not needed elsewhere
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const BACKEND_URL = "https://your-memories-backend.onrender.com"; // Your backend URL

export const CreateMemory = () => {

    const userID = useGetUserID(); // This is now primarily for initial state if you pre-fill something,
                                  // but userOwner is set by backend from token.
    const [cookies, _] = useCookies(["access_token"]);

    const [memory, setMemory] = useState({
        name: "",
        descriptions: [],
        imageURL: "",
        timeSpent: "",
        // userOwner: userID, // <--- REMOVE THIS LINE
    });

    const navigate = useNavigate();

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

    const onSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.post(`${BACKEND_URL}/memories`, { ...memory },
                {
                    headers: {
                        // Ensure your cookie access_token is a pure JWT.
                        // Add "Bearer " prefix here if your login route doesn't return it with the token.
                        // Assuming your login route returns just the token, add "Bearer " here:
                        authorization: `Bearer ${cookies.access_token}`,
                    },
                }
            );
            alert("Memory Created!");
            navigate("/");
        } catch (err) {
            console.error("Error creating memory on frontend:", err.response?.data?.message || err.message);
            alert(`Failed to create memory: ${err.response?.data?.message || "Please check console for details."}`);
        }
    };

    return (
        <div className="create-memory">
            <h2>Create Memory</h2>
            <form onSubmit={onSubmit}>
                <label htmlFor="name">Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={memory.name}
                    onChange={handleChange}
                />

                <label htmlFor="descriptions">Descriptions</label>
                {memory.descriptions.map((description, idx) => (
                    <input
                        key={idx}
                        type="text"
                        name="descriptions"
                        value={description}
                        onChange={(event) => {
                            handleDescriptionChange(event, idx);
                        }}
                    />
                ))}
                <button onClick={addDescription} type="button">Add Description</button>

                <label htmlFor="imageURL">Image URL</label>
                <input
                    type="text"
                    id="imageURL"
                    name="imageURL"
                    value={memory.imageURL}
                    onChange={handleChange}
                />

                <label htmlFor="timeSpent">Time Spent</label>
                <input
                    type="text"
                    id="timeSpent"
                    name="timeSpent"
                    value={memory.timeSpent}
                    onChange={handleChange}
                />

                <button type="submit">Create Memory</button>
            </form>
        </div>
    );
};