import React from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import HomeLayout from '../layout/HomeLayout';

const Home = () => {
  const { user } = useOutletContext();

  if (!user) {
    return <Navigate to="/authentication/login" replace />;
  }

  const userRole = user?.role?.toLowerCase();
  if (userRole) {
    return <Navigate to={`/home/${userRole}`} replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-slate-400">Loading session...</p>
    </div>
  );
}

export default Home;