import { useContext } from "react";
import { UserContext } from "../context/UserContext";

function Navbar() {
  const { user, setUser } = useContext(UserContext);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "15px 20px",
        background: "#222",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2 style={{ margin: 0 }}>Space Marketplace</h2>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {user && <span>{user.email}</span>}

        {user && (
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 10px",
              background: "#ff4d4d",
              border: "none",
              color: "white",
              cursor: "pointer",
              borderRadius: "5px",
            }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default Navbar;