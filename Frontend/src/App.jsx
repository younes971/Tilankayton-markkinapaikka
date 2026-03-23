import RegisterPage from "./pages/RegisterPage";
import UploadPage from "./pages/UploadPage";
import { Routes, Route, Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./context/UserContext";
import Navbar from "./components/Navbar"; 
import SpacesPage from "./pages/SpacesPage";
import LoginPage from "./pages/LoginPage";


function App() {
  // get logged-in user
  const { user, logout } = useContext(UserContext);

  return (
    <div>
      {/*  NAVBAR */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px",
          borderBottom: "1px solid #ccc",
        }}
      >
        {/* LEFT */}
        <div>
          <Link to="/">Home</Link>
        </div>

        {/* RIGHT */}
        <div>
          {user ? (
            <>
              <span style={{ marginRight: "10px" }}>
                {user.email}
              </span>

              <Link to="/upload" style={{ marginRight: "10px" }}>
                Upload
              </Link>

              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: "10px" }}>
                Login
              </Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>

      {/*  PAGES */}
      <Routes>
        <Route path="/" element={<SpacesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </div>
  );
}

export default App;