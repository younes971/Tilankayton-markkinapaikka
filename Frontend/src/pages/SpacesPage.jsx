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
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showMine, setShowMine] = useState(false);

  // FETCH
  const fetchSpaces = () => {
    fetch("http://localhost:3001/spaces")
      .then((res) => res.json())
      .then((data) => setSpaces(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  // CREATE
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("owner", user.email);
    formData.append("price", price);
    formData.append("category", category);
    if (image) formData.append("image", image);

    fetch("http://localhost:3001/spaces", {
      method: "POST",
      body: formData,
    }).then(() => {
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
    if (!user || user.email !== space.owner) return;

    const newTitle = prompt("Title:", space.title);
    const newDescription = prompt("Description:", space.description);
    const newPrice = prompt("Price:", space.price);
    const newCategory = prompt("Category:", space.category);

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
    if (!user) return;

    if (space.reserved) {
      alert("Already reserved");
      return;
    }

    fetch(`http://localhost:3001/spaces/${space.id}/reserve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: user.email }),
    }).then(() => fetchSpaces());
  };

  // FILTER
  const filteredSpaces = spaces.filter((space) => {
    const matchesCategory =
      selectedCategory === "all" || space.category === selectedCategory;

    const matchesSearch =
      (space.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (space.description || "").toLowerCase().includes(search.toLowerCase());

    const matchesOwner = !showMine || (user && space.owner === user.email);
    const matchesReserved =
      !showMine || (user && space.reservedBy === user.email);

    return (
      matchesCategory &&
      matchesSearch &&
      (showMine ? matchesOwner || matchesReserved : true)
    );
  });

  // SORT
  const sortedSpaces = [...filteredSpaces].sort((a, b) => {
    if (sortOrder === "low") return Number(a.price) - Number(b.price);
    if (sortOrder === "high") return Number(b.price) - Number(a.price);
    return 0;
  });

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto",background: "linear-gradient(to bottom, #f4f6f8, #e9eef3)", backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center" }}> Marketplace Spaces</h1>

      {!user && (
        <p style={{ textAlign: "center", color: "gray" }}>
          Please login to add a space
        </p>
      )}

      {user && (
        <>
          <h2 style={{ textAlign: "center" }}>Add New Space</h2>

          <form
            onSubmit={handleSubmit}
            style={{
              margin: "0 auto 30px auto",
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              background: "#f9f9f9",
              maxWidth: "500px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ width: "100%" }}>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: "100%", marginBottom: "10px" }}
              />
            </div>

            <div style={{ width: "100%" }}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", marginBottom: "10px" }}
              >
                <option value="workspace">🧑‍💼 Workspaces</option>
                <option value="event">🎉 Event Spaces</option>
              </select>
            </div>

            <div style={{ width: "100%" }}>
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                style={{ width: "100%", marginBottom: "10px" }}
              />
            </div>

            <div style={{ width: "100%" }}>
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{ width: "100%", marginBottom: "10px" }}
              />
            </div>

            <div style={{ width: "100%" }}>
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>

            <div style={{ width: "100%" }}>
              <input
                type="text"
                placeholder="Search spaces..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "10px",
                }}
              />
            </div>

            <div style={{ width: "100%" }}>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ width: "100%", marginTop: "10px" }}
              >
                <option value="">Sort by price</option>
                <option value="low">Low → High</option>
                <option value="high">High → Low</option>
              </select>
            </div>

            <button
              type="submit"
              style={{ marginTop: "10px", width: "100%", backgroundColor: "#333", color: "white" }}
            >
              Add Space
            </button>
          </form>
        </>
      )}

      {/* FILTER BUTTONS */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button onClick={() => { setSelectedCategory("all"); setShowMine(false); }}>
          All
        </button>
        <button onClick={() => { setSelectedCategory("workspace"); setShowMine(false); }}>
          Workspaces
        </button>
        <button onClick={() => { setSelectedCategory("event"); setShowMine(false); }}>
          Events
        </button>
        <button onClick={() => { setShowMine(true); setSelectedCategory("all"); }}>
          My Spaces
        </button>
      </div>

      {/* LIST */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {sortedSpaces.map((space) => (
          <div
            key={space.id}
            style={{
              borderRadius: "10px",
              padding: "10px",
              background: "white",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
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

            <p><strong>{space.title}</strong></p>
            <p>{space.description}</p>
            <p><strong>{space.price} $</strong></p>
            <p>{space.reserved ? "🔴 Reserved" : "🟢 Available"}</p>

            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <button onClick={() => handleReserve(space)} disabled={space.reserved || !user}>
                Reserve
              </button>
              <button onClick={() => handleEdit(space)} disabled={space.owner !== user?.email}>
                Edit
              </button>
              <button onClick={() => handleDelete(space)} disabled={space.owner !== user?.email}>
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