import { useCookies } from 'react-cookie';
import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [cookies, setCookies] = useCookies(["access_token"]);
  const navigate = useNavigate();

  const Logout = () => {
    setCookies("access_token", "");
    window.localStorage.clear();
    navigate("/auth");
  };

  return (
    <div className="navbar">
      <Link to="/">Home</Link>
      <Link to="/create-memory">Create Memory</Link>
      {!cookies.access_token ? (
        <Link to="/auth">Login/Register</Link>
      ) : (
        <>
          <Link to="/saved-memories">Saved Memories</Link>
          <button onClick={Logout}>Logout</button>
        </>
      )}
    </div>
  );
};
