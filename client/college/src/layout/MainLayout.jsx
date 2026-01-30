// src/layout/MainLayout.jsx
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="main-layout">
      
      
      <main>
        <Outlet />
      </main>

    
    </div>
  );
};

export default MainLayout;
