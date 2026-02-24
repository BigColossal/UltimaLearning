import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useMemo } from "react";
import "../styles/Home.css";

const Home = () => {
  const { user } = useUser();
  const displayName = user?.username || "there";

  // Floating particles for ember effect
  const particles = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 12 + Math.random() * 12,
      size: 2 + Math.random() * 3,
    }));
  }, []);

  return (
    <div className="home">
      <section className="hero hero-full">
        {/* Particle Background */}
        <div className="hero-particles">
          {particles.map((p) => (
            <span
              key={p.id}
              className="hero-particle"
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

        {/* Hero Text Left */}
        <div className="hero-container hero-left-align">
          <h1 className="hero-title">
            Forge Your{" "}
            <span className="gradient-text pulse-text">Learning Engine</span>
          </h1>

          <p className="hero-subtitle">
            Engineer your growth with structure, clarity, and deliberate
            progression.
          </p>

          {user && (
            <p className="hero-welcome">
              Welcome back, <span>{displayName}</span>.
            </p>
          )}

          <div className="hero-actions">
            <Link to="/hub" className="btn-primary">
              Enter Hub →
            </Link>
          </div>
        </div>

        {/* Subtle Ember Glow */}
        <div className="hero-glow" />
      </section>
    </div>
  );
};

export default Home;
