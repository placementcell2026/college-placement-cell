import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";

const MainLayout = () => {
  const location = useLocation();
  const showNavbar = location.pathname === "/home";

  return (
    <div
      className="main-layout"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "#e5e7eb",
      }}
    >
      {showNavbar && <Navbar />}

      <main style={{ flex: 1, paddingTop: showNavbar ? "80px" : "0" }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
