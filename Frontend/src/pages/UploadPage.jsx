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

    // check if logged in
    if (!user) {
      alert("You must be logged in to upload");
      return;
    }

    // send to backend
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

        // clear form
        setTitle("");
        setDescription("");

        // go back to home
        navigate("/");
      })
      .catch((err) => console.error("Upload error:", err));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Upload Space</h1>

      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Space title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <br />

        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default UploadPage;