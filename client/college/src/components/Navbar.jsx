import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Briefcase,
  Building2,
  User,
  LogOut,
  Bell,
} from "lucide-react";
import "./Navbar.css";

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const userRole = user?.role?.toLowerCase() || 'student';
  const homePath = `/home/${userRole}`;
  const profilePath = `/profile/${userRole}`;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: homePath, icon: <Home size={18} /> },
    { name: "Jobs", path: "/jobs", icon: <Briefcase size={18} /> },
    { name: "Companies", path: "/companies", icon: <Building2 size={18} /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/authentication/login");
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`navbar ${scrolled ? "scrolled" : ""}`}
    >
      <div className="nav-container">
        <div className="nav-content">
          {/* Logo */}
          <Link to={homePath} className="logo-link group">
            <div className="logo-icon">C</div>
            <span className="logo-text">Placement Cell</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="desktop-nav">
            <div className="nav-links">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} className="nav-link">
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Profile & Notifications */}
            <div className="user-actions">
              <Link to="/notifications" className="icon-btn">
                <Bell size={20} />
                <span className="notification-dot" />
              </Link>

              <div className="divider" />

              <Link to={profilePath} className="profile-section">
                <div className="avatar-ring">
                  <div className="avatar">
                    <User size={18} className="text-gray-300" />
                  </div>
                </div>
              </Link>
                <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="logout-btn">
                  Logout
                  <LogOut size={16} />
                </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="mobile-toggle">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mobile-menu"
          >
            <div className="mobile-menu-content">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="mobile-link"
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              <Link
                to={profilePath}
                onClick={() => setIsOpen(false)}
                className="mobile-link"
              >
                <User size={18} />
                Profile
              </Link>
              <div className="mobile-divider" />
              <button onClick={handleLogout} className="mobile-logout">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
