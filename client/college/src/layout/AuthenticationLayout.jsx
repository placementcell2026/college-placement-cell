import { Outlet } from "react-router-dom";

function AuthenticationLayout() {
  return (
    <div className="auth-wrapper">  
      <Outlet />
    </div>
  );
}

export default AuthenticationLayout;
