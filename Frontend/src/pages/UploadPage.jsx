import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const handleUpload = (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to upload");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("owner", user.email);
    if (image) formData.append("image", image);

    fetch("http://localhost:3001/spaces", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Upload failed");
          return;
        }

        console.log("Uploaded:", data);

        setTitle("");
        setDescription("");
        setImage(null);

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
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        {/* NEW IMAGE INPUT */}
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          style={{ marginBottom: "15px" }}
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