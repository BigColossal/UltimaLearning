import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import "../styles/Navbar.css";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const linksRef = useRef([]);

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

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/hub", label: "Hub" },
    { path: "/profile", label: "Profile" },
  ];

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-particles">
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
      </div>

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
      </div>
    </nav>
  );
};

export default Navbar;
