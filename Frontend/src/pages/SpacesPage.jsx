import { useEffect, useState, useContext, useRef } from "react";
import { UserContext } from "../context/UserContext";

function SpacesPage() {
  const { user } = useContext(UserContext);

  const [spaces, setSpaces] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("workspace");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [comments, setComments] = useState({});
  const [message, setMessage] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [search, setSearch] = useState("");
const [newComments, setNewComments] = useState({});
const [visibleComments, setVisibleComments] = useState({});

  const [editingSpace, setEditingSpace] = useState(null);
  const formRef = useRef(null);

  const fetchSpaces = () => {
    fetch("http://localhost:3001/spaces")
      .then((res) => res.json())
      .then((data) => setSpaces(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) return;

    if (editingSpace) {
      fetch(`http://localhost:3001/spaces/${editingSpace.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title,
          description,
          price,
          category,
        }),
      }).then(() => {
        setEditingSpace(null);
        setTitle("");
        setDescription("");
        setPrice("");
        setCategory("workspace");
        fetchSpaces();
      });

      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    if (image) formData.append("image", image);

    fetch("http://localhost:3001/spaces", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
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

  const handleDelete = (space) => {
    if (!user) return;

    fetch(`http://localhost:3001/spaces/${space.id}`, {
      method: "DELETE",
    }).then(() => fetchSpaces());
  };

  const toggleComments = async (spaceId) => {
  if (visibleComments[spaceId]) {
    setVisibleComments((prev) => ({
      ...prev,
      [spaceId]: false,
    }));
    return;
  }

  await fetchComments(spaceId);

  setVisibleComments((prev) => ({
    ...prev,
    [spaceId]: true,
  }));
};

  const handleEdit = (space) => {
    if (!user) return;

    setEditingSpace(space);

    setTitle(space.title);
    setDescription(space.description);
    setPrice(space.price);
    setCategory(space.category);
    setStartDate(space.startDate?.slice(0, 10));
    setEndDate(space.endDate?.slice(0, 10));

    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleReserve = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/spaces/${id}/reserve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Reservation failed");
        return;
      }

      setMessage(data.message);
setTimeout(() => setMessage(""), 3000);
      fetchSpaces();
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  const handleLike = async (id) => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3001/spaces/${id}/like`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to like space");
      return;
    }

    fetchSpaces();
  } catch (error) {
    console.error("Like error:", error);
    alert("Something went wrong");
  }
};

const fetchComments = async (id) => {
  try {
    const response = await fetch(
      `http://localhost:3001/spaces/${id}/comments`
    );
    const data = await response.json();

    setComments((prev) => ({
      ...prev,
      [id]: data,
    }));
  } catch (error) {
    console.error(error);
  }
};

const handleComment = async (id) => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    return;
  }

  if (!newComments[id]?.trim()) return;

  try {
    await fetch(`http://localhost:3001/spaces/${id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        comment: newComments[id],
      }),
    });

    setNewComments((prev) => ({
      ...prev,
      [id]: "",
    }));

    fetchComments(id);
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "1200px",
        margin: "auto",
        minHeight: "100vh",
        fontFamily: "Arial",
background: "linear-gradient(180deg, #f7f7f7 0%, #ffffff 100%)",      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        Marketplace Spaces
      </h1>

      {/* FORM */}
      {user && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          style={{
            maxWidth: "520px",
            margin: "0 auto 40px auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
          }}
        >
          {editingSpace && (
            <p style={{ color: "#e67e22", fontWeight: "bold" }}>
              ✏️ Editing space...
            </p>
          )}

          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="workspace">Workspace</option>
            <option value="event">Event</option>
          </select>

          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

          <input placeholder="Price (€)" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

          <input type="file" onChange={(e) => setImage(e.target.files[0])} />

          <button
            style={{
              padding: "10px",
              background: "#222",
              color: "white",
              borderRadius: "8px",
            }}
          >
            {editingSpace ? "Update Space" : "Add Space"}
          </button>
        </form>
      )}

      {/* SORT DROPDOWN */}
<div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px",
  }}
>
  <select
    value={sortOrder}
    onChange={(e) => setSortOrder(e.target.value)}
    style={{
      padding: "12px 18px",
      borderRadius: "10px",
      border: "1px solid #ddd",
      fontSize: "16px",
      background: "white",
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    }}
  >
    <option value="default">Sort by</option>
    <option value="low-high">Price: Low to High</option>
    <option value="high-low">Price: High to Low</option>
  </select>
</div>

{/* SEARCH */}
<div style={{ marginBottom: "20px", textAlign: "center" }}>
  <input
    type="text"
    placeholder="Search spaces..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      padding: "10px",
      width: "300px",
      borderRadius: "8px",
      border: "1px solid #ccc",
    }}
  />
</div>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "22px",
        }}
      >

        
        {[...spaces]
  .filter((space) =>
    space.title.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => {
  if (sortOrder === "low-high") {
    return Number(a.price) - Number(b.price);
  }

  if (sortOrder === "high-low") {
    return Number(b.price) - Number(a.price);
  }

  return 0;
}).map((space) => {
          const isReserved =
            space.reserved === true ||
            space.reserved === 1 ||
            space.reserved === "1";

          const isOwner = user && space.owner === user.email;

          return (
            <div
              key={space.id}
              style={{
                background: "white",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                transition: "all 0.25s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 18px 35px rgba(0,0,0,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.08)";
              }}
            >
              {/* IMAGE */}
              <div style={{ position: "relative" }}>
                {space.image && (
                  <img
                    src={`http://localhost:3001${space.image}`}
                    style={{
                      width: "100%",
                      height: "190px",
                      objectFit: "cover",
                    }}
                  />
                )}

                {/* CATEGORY */}
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    background: "rgba(255,255,255,0.9)",
                    padding: "6px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {space.category === "workspace" ? "🧑‍💼 Workspace" : "🎉 Event"}
                </div>

                {/* PRICE */}
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "#111",
                    color: "white",
                    padding: "6px 10px",
                    borderRadius: "20px",
                    fontSize: "13px",
                  }}
                >
                  € {space.price}
                </div>
              </div>

              {/* CONTENT */}
              <div style={{ padding: "15px", paddingTop: "22px" }}>
                <h3
  style={{
    marginTop: "14px",
    marginBottom: "8px",
    lineHeight: "1.3",
    fontSize: "16px",
    fontWeight: "500",
  }}
>
  {space.title}
</h3>

{message && (
  <div
    style={{
      background: "#d4edda",
      color: "#155724",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "20px",
      textAlign: "center",
    }}
  >
    {message}
  </div>
)}

                <p style={{ fontSize: "13px", color: "#666" }}>
                  {space.description}
                </p>

                {/* LABELS */}
                <p style={{ fontSize: "12px", margin: "4px 0" }}>
                  <strong>Price:</strong> € {space.price}
                </p>

                <p style={{ fontSize: "12px", margin: "4px 0" }}>
                  <strong>Category:</strong> {space.category}
                </p>

                <p style={{ fontSize: "12px", margin: "4px 0" }}>
                  <strong>Available:</strong>{" "}
                  {new Date(space.startDate).toLocaleDateString()} →{" "}
                  {new Date(space.endDate).toLocaleDateString()}
                </p>

                <p
                  style={{
                    fontWeight: "bold",
                    color: isReserved ? "red" : "green",
                  }}
                >
                  {isReserved ? "🔴 Reserved" : "🟢 Available"}
                </p>

                {space.reservedBy && (
                  <p style={{ fontSize: "12px", color: "#555" }}>
                    Booked by: {space.reservedBy}
                  </p>
                )}

                <div style={{ marginTop: "15px" }}>
  <button
    onClick={() => handleLike(space.id)}
    style={{
      border: "none",
      background: "none",
      cursor: "pointer",
      fontSize: "16px",
      marginBottom: "10px",
    }}
  >
    👍 {space.likes || 0}
  </button>

  <button
  onClick={() => toggleComments(space.id)}
  style={{
    border: "none",
    background: "#f5f5f5",
    padding: "8px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    marginBottom: "10px",
    fontWeight: "500",
    display: "block",
    width: "100%",
  }}
>
  {visibleComments[space.id] ? "Hide Comments" : "Show Comments"}
</button>

{visibleComments[space.id] && (
  <>
    <div style={{ marginBottom: "12px" }}>
      {comments[space.id]?.length > 0 ? (
        comments[space.id].map((comment) => (
          <div
            key={comment.id}
            style={{
              marginTop: "8px",
              padding: "10px",
              background: "#f8f9fa",
              borderRadius: "10px",
              border: "1px solid #eee",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: "13px",
                marginBottom: "4px",
              }}
            >
              {comment.userEmail}
            </div>

            <div
              style={{
                fontSize: "14px",
                color: "#444",
              }}
            >
              {comment.comment}
            </div>
          </div>
        ))
      ) : (
        <p style={{ color: "#777", fontSize: "14px" }}>
          No comments yet.
        </p>
      )}
    </div>

    {user && (
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComments[space.id] || ""}
          onChange={(e) =>
            setNewComments((prev) => ({
              ...prev,
              [space.id]: e.target.value,
            }))
          }
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        />

        <button
          onClick={() => handleComment(space.id)}
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            background: "#222",
            color: "white",
            cursor: "pointer",
          }}
        >
          Post
        </button>
      </div>
    )}
  </>
)}
</div>
                {/* ACTIONS */}
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  {!isOwner && (
                    <button
                      onClick={() => handleReserve(space.id)}
                      disabled={isReserved}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "8px",
                        border: "none",
                        background: isReserved ? "#ccc" : "#1976d2",
                        color: "white",
                      }}
                    >
                      Reserve
                    </button>
                  )}

                  {isOwner && (
                    <>
                      <button onClick={() => handleEdit(space)}>Edit</button>
                      <button onClick={() => handleDelete(space)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SpacesPage;
