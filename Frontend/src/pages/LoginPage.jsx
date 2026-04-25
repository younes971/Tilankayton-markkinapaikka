import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    // ❌ if login failed → stop here
    if (!res.ok) {
      setError(data.error);
      return;
    }

    // ✅ ONLY save token if login is successful
    localStorage.setItem("token", data.token);

    login(data.user);
    navigate("/");

  } catch (err) {
    console.error(err);
    setError("Something went wrong");
  }
};

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f4f4f4",
      }}
    >

      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: "350px",
          padding: "25px",
          border: "1px solid #ddd",
          borderRadius: "12px",
          background: "#fff",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Login
        </h2>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
          }}
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "15px",
          }}
        />

        {error && (
        <p style={{ color: "red", textAlign: "center"}}>{error}</p>
      )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;