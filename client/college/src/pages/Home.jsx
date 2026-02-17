import React from 'react';
import { useOutletContext } from 'react-router-dom';
import HomeLayout from '../layout/HomeLayout';

const Home = () => {
  const { user } = useOutletContext();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-slate-400">Loading student session...</p>
      </div>
    );
  }

  return (
    <div>
        <HomeLayout user={user} />
    </div>
  );
}

export default Home;