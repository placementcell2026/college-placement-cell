import React, { useState, useEffect } from 'react';
import HomeLayout from '../layout/HomeLayout';

const Home = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        setUserData(JSON.parse(savedUser));
    }
  }, []);

  if (!userData) {
    return null; // Or a loading spinner
  }

  return (
    <div>
        <HomeLayout user={userData} />
    </div>
  );
}

export default Home;