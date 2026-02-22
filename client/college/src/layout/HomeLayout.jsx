import React from 'react';
import Student from '../pages/Users/Student';
import Teacher from '../pages/Users/Teacher';
import PlacementOfficer from '../pages/Users/PlacementOfficer';

const HomeLayout = ({ user }) => {
  const role = user?.role;

  // If no role is passed, default to Student for safety or show a loading/error state
  if (!role) {
      return <Student user={user} />;
  }

  switch (role) {
    case 'student':
      return <Student user={user} />;
    case 'teacher':
      return <Teacher user={user} />;
    case 'placement':
    case 'placement_officer': // Handle potential naming variations
      return <PlacementOfficer user={user} />;
    default:
      return <Student user={user} />;
  }
};

export default HomeLayout;
