import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

function AuthPage() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.box}>
        <LoginPage />
        <hr style={styles.line} />
        <RegisterPage />
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 80px)",
    backgroundColor: "#f5f5f5",
  },
  box: {
    backgroundColor: "white",
    padding: "32px",
    width: "400px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  line: {
    margin: "24px 0",
  },
};

export default AuthPage;
