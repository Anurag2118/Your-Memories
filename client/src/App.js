import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/home";
import { Auth } from "./pages/auth";
import { CreateMemory } from "./pages/create-memory";
import { SavedMemories } from "./pages/saved-memories";
import { Navbar } from "./Components/navbar";

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create-memory" element={<CreateMemory />} />
          <Route path="/saved-memories" element={<SavedMemories />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
