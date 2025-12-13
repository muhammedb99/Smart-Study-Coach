import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";

function App() {
  return (
    <BrowserRouter>
      {/* NAVBAR */}
      <header style={navWrapper}>
        <nav style={navStyle}>
          {/* ימין – לוגו */}
          <div style={logoWrapper}>
            <span style={logoIcon}>🎓</span>
            <span style={logoText}>Smart Study Coach</span>
          </div>

          {/* שמאל – קישורים */}
          <div style={linksStyle}>
            <NavLink
              to="/"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeLink : {}),
              })}
            >
              דף הבית
            </NavLink>

            <NavLink
              to="/history"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeLink : {}),
              })}
            >
              היסטוריה
            </NavLink>
          </div>
        </nav>
      </header>

      {/* תוכן */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

/* ---------------- STYLES ---------------- */

const navWrapper = {
  position: "sticky" as const,
  top: 0,
  zIndex: 100,
  backdropFilter: "blur(10px)",
  background: "rgba(2,6,23,0.85)",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const navStyle = {
  direction: "rtl" as const,
  maxWidth: 1200,
  margin: "0 auto",
  padding: "16px 32px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const logoWrapper = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const logoIcon = {
  fontSize: 22,
};

const logoText = {
  fontSize: 20,
  fontWeight: 800,
  color: "#ffffff",
  letterSpacing: 0.3,
};

const linksStyle = {
  display: "flex",
  gap: 28,
};

const linkStyle = {
  color: "#c7d2fe",
  textDecoration: "none",
  fontSize: 16,
  fontWeight: 500,
  position: "relative" as const,
  paddingBottom: 4,
  transition: "color 0.2s ease",
};

const activeLink = {
  color: "#60a5fa",
  fontWeight: 700,
  borderBottom: "2px solid #60a5fa",
};
