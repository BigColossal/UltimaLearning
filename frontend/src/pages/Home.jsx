import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useMemo } from "react";
import "../styles/Home.css";

const Home = () => {
  const { user } = useUser();
  const displayName = user?.username || "there";

  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 6,
      size: 2 + Math.random() * 3,
    }));
  }, []);

  return (
    <div className="home">
      {/* ================= HERO ================= */}
      <section className="hero hero-full">
        <div className="home-particles">
          {particles.map((p) => (
            <span
              key={p.id}
              className="home-particle"
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

        <div className="hero-container hero-left-align">
          <h1 className="hero-title">
            Forge Your{" "}
            <span className="gradient-text pulse-text">Learning Engine</span>
          </h1>

          <p className="hero-subtitle">
            AI-powered testing that adapts to your knowledge level and breaks
            any subject into measurable skills.
          </p>

          <div className="hero-actions">
            <Link to="/hub" className="btn-primary">
              Enter Hub
            </Link>
            <Link to="/about" className="btn-secondary">
              How It Works
            </Link>
          </div>
        </div>

        <div className="hero-mountain-wrapper">
          <img
            src="mountain.png"
            alt="volcano silhouette"
            className="hero-mountain"
          />
        </div>

        <div className="hero-glow" />
      </section>

      {/* ================= PROBLEM ================= */}
      <section className="section problem-section">
        <div className="top-divider"></div>
        <div className="ruins-container">
          <div
            className="ruins ruin-1"
            style={{ backgroundImage: "url('ruins.png')" }}
          ></div>
          <div
            className="ruins ruin-2"
            style={{ backgroundImage: "url('ruins2.webp')" }}
          ></div>
          <div
            className="ruins ruin-3"
            style={{ backgroundImage: "url('ruins3.png')" }}
          ></div>
          <div
            className="ruins ruin-4"
            style={{ backgroundImage: "url('ruins4.png')" }}
          ></div>
        </div>
        <div className="ash-layer">
          {Array.from({ length: 120 }).map((_, i) => {
            const driftY = Math.random() * 1000 - 200; // vertical movement
            const wobble = Math.random() * 200 - 40; // horizontal turbulence
            const scale = 0.4 + Math.random() * 1.2;
            const blur = Math.random() * 1.5;

            return (
              <span
                key={i}
                className="ash"
                style={{
                  top: `${Math.random() * 100}%`,
                  animationDuration: `${12 + Math.random() * 12}s`,
                  animationDelay: `${Math.random() * 14}s`,
                  "--driftY": `${driftY}px`,
                  "--wobble": `${wobble}px`,
                  "--scale": scale,
                  filter: `blur(${blur}px)`,
                }}
              />
            );
          })}
        </div>
        <div className="section-container">
          <h2 className="section-title">Learning nowadays is problematic.</h2>
          <p className="section-text">
            You bounce from topic to topic, unsure what you truly understand.
            Your weak spots stay hidden. Progress feels invisible. And generic
            quizzes treat everyone the same.
          </p>
        </div>
      </section>

      {/* ================= SOLUTION ================= */}
      <section className="section solution-section">
        <div className="section-container">
          <h2 className="section-title">
            So, We Created the Perfect Learning Tool for You.
          </h2>
          <p className="section-text">
            Define any subject. Break it into subskills. Let AI generate
            adaptive tests that target exactly what you need to improve.
          </p>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="section features-section">
        <div className="section-container">
          <h2 className="section-title">Core Capabilities</h2>

          <div className="features-grid">
            <div className="feature-card">
              <h3>Custom Subjects</h3>
              <p>
                Create learning tracks for anything — math, programming,
                languages, philosophy.
              </p>
            </div>

            <div className="feature-card">
              <h3>Subskill Targeting</h3>
              <p>
                Break subjects into granular skills and train weaknesses
                directly.
              </p>
            </div>

            <div className="feature-card">
              <h3>Adaptive AI Testing</h3>
              <p>
                Questions evolve based on your performance. No static quizzes.
              </p>
            </div>

            <div className="feature-card">
              <h3>Progress Tracking</h3>
              <p>
                Visualize growth across each subskill with measurable
                performance metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="section how-section">
        <div className="section-container">
          <h2 className="section-title">How It Works</h2>

          <div className="steps">
            <div className="step">
              <span className="step-number">1</span>
              <p>Choose or create a subject.</p>
            </div>

            <div className="step">
              <span className="step-number">2</span>
              <p>Define the subskills you want to master.</p>
            </div>

            <div className="step">
              <span className="step-number">3</span>
              <p>Train with AI-generated adaptive tests.</p>
            </div>

            <div className="step">
              <span className="step-number">4</span>
              <p>Level up through structured progression.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="section faq-section">
        <div className="section-container">
          <h2 className="section-title">FAQ</h2>

          <div className="faq-item">
            <h4>Is this limited to academic subjects?</h4>
            <p>
              No. You can train any skill — technical, creative, analytical.
            </p>
          </div>

          <div className="faq-item">
            <h4>Does the AI adapt to my performance?</h4>
            <p>
              Yes. Question difficulty and focus adjust based on your results.
            </p>
          </div>

          <div className="faq-item">
            <h4>Can I track my weak areas?</h4>
            <p>Each subskill has measurable progress metrics.</p>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="section final-cta">
        <div className="section-container center">
          <h2 className="section-title">Ready to Engineer Your Growth?</h2>
          <Link to="/hub" className="btn-primary large">
            Start Training
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
