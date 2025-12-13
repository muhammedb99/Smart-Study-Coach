import { Link } from "react-router-dom";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header style={header}>
        <h2>🎓 Smart Study Coach</h2>
        <nav>
          <Link to="/">דף הבית</Link>
          <Link to="/history">היסטוריה</Link>
        </nav>
      </header>

      <main style={container}>
        {children}
      </main>
    </>
  );
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 40px",
  background: "#111",
  color: "white",
};

const container = {
  maxWidth: 1000,
  margin: "40px auto",
  padding: 30,
  background: "#f9fafb",
  borderRadius: 16,
};
