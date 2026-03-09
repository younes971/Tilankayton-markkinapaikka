import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./contexts/UserContext";
import Header from "./components/Header";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";

function App() {
  const { user } = useContext(UserContext);

  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<AuthPage />} />

        <Route
          path="/home"
          element={user ? <HomePage /> : <Navigate to="/" />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;