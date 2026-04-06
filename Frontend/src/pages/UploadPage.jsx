import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const handleUpload = (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to upload");
      return;
    }

    fetch("http://localhost:3001/spaces", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        reserved: false,
        owner: user.email,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Uploaded:", data);

        setTitle("");
        setDescription("");

        navigate("/");
      })
      .catch((err) => console.error("Upload error:", err));
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
        onSubmit={handleUpload}
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
          Upload Space
        </h2>

        <input
          type="text"
          placeholder="Space title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
          }}
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "15px",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Upload
        </button>
      </form>
    </div>
  );
}

export default UploadPage;