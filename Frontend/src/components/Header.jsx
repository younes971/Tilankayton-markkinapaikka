import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/userContext";

function Header() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header style={styles.header}>
      <h2 style={styles.logo}>Tilankäytön Markkinapaikka</h2>

      <nav style={styles.nav}>
        <Link to="/upload">Upload</Link>

        {!user && <Link to="/">Login</Link>}

        {user && (
          <>
            <span>{user.email}</span>
            <button onClick={handleLogout} style={styles.button}>
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    borderBottom: "1px solid #ddd",
  },
  logo: {
    margin: 0,
  },
  nav: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  button: {
    padding: "4px 8px",
    cursor: "pointer",
  },
};

export default Header;