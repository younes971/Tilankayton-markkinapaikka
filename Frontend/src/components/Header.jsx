import { Link } from "react-router-dom";

function Header() {
  return (
    <header style={styles.header}>
      <h2 style={styles.logo}>Tilankäytön Markkinapaikka</h2>

      <nav style={styles.nav}>
        <Link to="/upload">Upload</Link>
        <Link to="/">Login</Link>
        <Link to="/">Logout</Link>
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
  },
};

export default Header;
