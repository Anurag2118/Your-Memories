import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

export const Navbar = () => {
  const [cookies, setCookies] = useCookies(["access_token"]);
  const navigate = useNavigate();
  
  const isLoggedIn = Boolean(cookies.access_token && window.localStorage.getItem("userID"));

  const logout = () => {
    setCookies("access_token", "");
    window.localStorage.removeItem("userID");
    window.localStorage.clear();
    navigate("/auth");
  };

  return (
    <div style={styles.navbar}>
      <Link to="/" style={styles.brand}>
        Your Memories
      </Link>
      
      <div style={styles.navLinks}>
        <Link to="/" style={styles.link}>HOME</Link>
        
        {!isLoggedIn ? (
          <Link to="/auth" style={styles.link}>LOGIN / REGISTER</Link>
        ) : (
          <>
            <Link to="/create-memory" style={styles.link}>CREATE MEMORY</Link>
            <Link to="/saved-memories" style={styles.link}>SAVED MEMORIES</Link>
            <button onClick={logout} style={styles.logoutBtn}>LOGOUT</button>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: "15px 20px",
    gap: "15px",
  },
  brand: {
    color: "white",
    textDecoration: "none",
    fontSize: "1.4rem",
    fontWeight: "bold",
  },
  navLinks: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "15px",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "0.9rem",
    textTransform: "uppercase",
  },
  logoutBtn: {
    backgroundColor: "#d32f2f",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.9rem",
  }
};