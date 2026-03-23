import { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";

function SpacesPage() {
  const { user } = useContext(UserContext);

  const [spaces, setSpaces] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("workspace");

  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchSpaces = () => {
    fetch("http://localhost:3001/spaces")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched spaces:", data);
        setSpaces(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  // CREATE
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("owner", user.email);
    formData.append("price", price);
    formData.append("category", category);
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }
    console.log("Sending:", {
  title,
  description,
  price,
  category,
});

    if (image) formData.append("image", image);

    fetch("http://localhost:3001/spaces", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        setTitle("");
        setDescription("");
        setImage(null);
        setPrice("");
        setCategory("workspace");
        fetchSpaces();
      });
  };

  // DELETE
  const handleDelete = (space) => {
    if (!user || user.email !== space.owner) return;

    fetch(`http://localhost:3001/spaces/${space.id}`, {
      method: "DELETE",
    }).then(() => fetchSpaces());
  };

  // EDIT
  const handleEdit = (space) => {
    const newTitle = prompt("Title:", space.title);
    const newDescription = prompt("Description:", space.description);
    const newPrice = prompt("Price:", space.price);
    const newCategory = prompt("Category (workspace/event):", space.category);

    if (!newTitle || !newDescription || !newPrice || !newCategory) return;

    fetch(`http://localhost:3001/spaces/${space.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...space,
        title: newTitle,
        description: newDescription,
        price: newPrice,
        category: newCategory,
      }),
    }).then(() => fetchSpaces());
  };

  // RESERVE
  const handleReserve = (space) => {
  if (!user || user.email !== space.owner) {
    alert("You can only reserve your own space");
    return;
  }

  fetch(`http://localhost:3001/spaces/${space.id}/reserve`, {
    method: "PATCH",
  })
    .then((res) => res.json())
    .then(() => fetchSpaces())
    .catch((err) => console.error("Reserve error:", err));
};

  // FILTER
  const filteredSpaces = spaces.filter((space) =>
    selectedCategory === "all"
      ? true
      : space.category === selectedCategory
  );

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>Marketplace Spaces</h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: "30px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          background: "#f9f9f9",
        }}
      >
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        >
          <option value="workspace">🧑‍💼 Workspaces</option>
          <option value="event">🎉 Event Spaces</option>
        </select>

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button type="submit" style={{ marginTop: "10px" }}>
          Add Space
        </button>
      </form>

      {/* FILTER */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button onClick={() => setSelectedCategory("all")}>All</button>
        <button onClick={() => setSelectedCategory("workspace")}>
          Workspaces
        </button>
        <button onClick={() => setSelectedCategory("event")}>
          Event Spaces
        </button>
      </div>

      {/* GRID LIST */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {filteredSpaces.map((space) => (
          <div
            key={space.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "10px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              background: "white",
            }}
          >
            {space.image && (
              <img
                src={`http://localhost:3001${space.image}`}
                alt=""
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            )}

            <h3>{space.title}</h3>

            <p style={{ fontSize: "14px" }}>{space.description}</p>

            <p>
              {space.category === "workspace"
                ? "🧑‍💼 Workspace"
                : "🎉 Event Space"}
            </p>

            <p><strong>${space.price}</strong></p>

            <p style={{ fontSize: "12px" }}>
              {space.reserved ? "🔴 Reserved" : "🟢 Available"}
            </p>

            <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
  <button
    onClick={() => handleReserve(space)}
    disabled={space.reserved}
  >
    Reserve
  </button>

  <button
    onClick={() => handleEdit(space)}
    disabled={!user || user.email !== space.owner}
  >
    Edit
  </button>

  <button
    onClick={() => handleDelete(space)}
    disabled={!user || user.email !== space.owner}
  >
    Delete
  </button>
</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpacesPage;