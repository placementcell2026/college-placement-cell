// src/layout/MainLayout.jsx
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div
      className="main-layout"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>


    </div>
  );
};

export default MainLayout;
