import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const linksRef = useRef([]);
  const dropdownRef = useRef(null);
  const { isAuthenticated, user, logout } = useAuth();

  // Generate particles once (not on every render)
  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 6,
      size: 2 + Math.random() * 3,
    }));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  // Magnetic hover
  const handleMouseMove = (e, index) => {
    const el = linksRef.current[index];
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  };

  const handleMouseLeave = (index) => {
    const el = linksRef.current[index];
    if (!el) return;
    el.style.transform = "translate(0px, 0px)";
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  const navLinks = [{ path: "/", label: "Home" }];

  // Only show hub and profile if authenticated
  if (isAuthenticated) {
    navLinks.push({ path: "/learning-hub", label: "Learning Hub" });
  }

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      {/* <div className="navbar-particles">
        {particles.map((p) => (
          <span
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div> */}

      <div className="navbar-glow" />

      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🔥</span>
          Volcanicus
        </Link>

        <div className="navbar-links">
          {navLinks.map((link, index) => (
            <Link
              key={link.path}
              to={link.path}
              ref={(el) => (linksRef.current[index] = el)}
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseLeave={() => handleMouseLeave(index)}
              className={`nav-link ${
                location.pathname === link.path ? "active" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="user-dropdown" ref={dropdownRef}>
              <button
                className="user-button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="user-avatar">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} />
                  ) : (
                    <span>{user?.name?.charAt(0) || "U"}</span>
                  )}
                </span>
                <span className="user-name">{user?.name || "User"}</span>
              </button>

              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dropdown-email">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    📋 Profile
                  </Link>
                  <button
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
