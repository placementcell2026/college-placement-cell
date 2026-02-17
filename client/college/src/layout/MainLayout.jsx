import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const internalPages = ["/home", "/profile", "/notifications", "/jobs", "/companies"];
  const showNavbar = internalPages.some(path => location.pathname.startsWith(path));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className="main-layout"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "#e5e7eb",
        backgroundColor: "#0f172a"
      }}
    >
      {showNavbar && <Navbar user={user} />}

      <main style={{ flex: 1, paddingTop: showNavbar ? "80px" : "0" }}>
        <Outlet context={{ user }} />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
