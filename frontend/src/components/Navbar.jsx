import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useUser } from "../context/UserContext"; // 👈 import your auth context
import "../styles/Navbar.css";

const Navbar = () => {
  const { user, logout } = useUser(); // get user and logout
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const linksRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Base nav links
  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/hub", label: "Hub" },
  ];

  // Add auth-specific links
  if (user) {
    navLinks.push({ path: "/profile", label: "Profile" });
    navLinks.push({
      path: "/logout",
      label: "Logout",
      onClick: () => {
        logout();
        navigate("/");
      },
    });
  } else {
    navLinks.push({ path: "/login", label: "Login" });
  }

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
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
              to={link.path !== "/logout" ? link.path : "#"} // logout is handled via onClick
              ref={(el) => (linksRef.current[index] = el)}
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseLeave={() => handleMouseLeave(index)}
              onClick={link.onClick} // only exists for logout
              className={`nav-link ${
                location.pathname === link.path ? "active" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
