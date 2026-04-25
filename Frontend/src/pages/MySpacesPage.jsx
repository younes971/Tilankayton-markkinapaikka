import { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";

function MySpacesPage() {
  const { user } = useContext(UserContext);
  const [spaces, setSpaces] = useState([]);

  const fetchSpaces = () => {
    fetch("http://localhost:3001/spaces")
      .then((res) => res.json())
      .then((data) => {
        
        // ONLY MY SPACES
        const mySpaces = data.filter(
          (space) => user && space.owner === user.email
        );
        setSpaces(mySpaces);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchSpaces();
  }, [user]);

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        My Spaces
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "25px",
        }}
      >
        {spaces.map((space) => {
          const isReserved =
            space.reserved === true ||
            space.reserved === 1 ||
            space.reserved === "1";

          return (
            <div
              key={space.id}
              style={{
                background: "white",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ position: "relative" }}>
                {space.image && (
                  <img
                    src={`http://localhost:3001${space.image}`}
                    alt=""
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                    }}
                  />
                )}

                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    background: "#fff",
                    padding: "5px 10px",
                    borderRadius: "6px",
                  }}
                >
                  {space.category === "workspace"
                    ? "🧑‍💼 Workspace"
                    : "🎉 Event"}
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "rgba(0,0,0,0.7)",
                    color: "white",
                    padding: "5px 10px",
                  }}
                >
                  € {space.price}
                </div>
              </div>

              <div style={{ padding: "15px" }}>
                <h3>{space.title}</h3>

                <p>
                  <strong>Description:</strong> {space.description}
                </p>

                <p>
                  <strong>Price:</strong> {space.price} €
                </p>

                <p>
                  <strong>Available:</strong>{" "}
                  {new Date(space.startDate).toLocaleDateString()} →{" "}
                  {new Date(space.endDate).toLocaleDateString()}
                </p>

                <p>
  <strong>Status:</strong>{" "}
  {isReserved ? "🔴 Booked" : "🟡 Not booked"}
</p>

                {isReserved && <p>👤 {space.reservedBy}</p>}

                {/*  NO ACTIONS IN MY SPACES (READ ONLY) */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button disabled>Reserve</button>
                  <button disabled>Edit</button>
                  <button disabled>Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MySpacesPage;
