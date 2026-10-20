import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Search,
  GraduationCap,
  ShoppingBag,
  HeartHandshake,
  Megaphone,
  Store,
  Car,
  Star,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { AdvertisementBanner } from "../components/AdvertisementBanner";

export default function Landing() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/explore");
    }
  };

  const HUB_PREVIEWS = [
    {
      title: "Academic Hub",
      desc: "Tutoring, past papers & lecture notes",
      icon: GraduationCap,
      color: "#0ea5e9",
      tag: "5 posts",
    },
    {
      title: "Marketplace",
      desc: "Textbooks, lab gear & electronics",
      icon: ShoppingBag,
      color: "#f59e0b",
      tag: "10 posts",
    },
    {
      title: "Skill Exchange",
      desc: "Coding, design & language swap",
      icon: HeartHandshake,
      color: "#a855f7",
      tag: "10 posts",
    },
    {
      title: "Campus Services",
      desc: "Printing, poster plotting & repairs",
      icon: Store,
      color: "#06b6d4",
      tag: "8 posts",
    },
  ];

  return (
    <div className="landing-premium">
      {/* Top Navbar */}
      <nav className="landing-nav-bar">
        <div className="landing-nav-container">
          <Link to="/" className="landing-brand">
            <span className="brand-badge">U+</span>
            <span className="brand-text">
              Uni<span className="brand-accent">Swap</span>+
            </span>
          </Link>

          <div className="landing-nav-links">
            <a href="#hubs">Campus Hubs</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#campus-deals">Partner Deals</a>
            <Link to="/explore">Explore Feed</Link>
          </div>

          <div className="landing-nav-actions">
            <ThemeToggle />
            <Link to="/login" className="btn btn-ghost landing-login-btn">
              Log in
            </Link>
            <Link to="/register" className="btn btn-primary landing-signup-btn">
              Get Started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero-section">
        <div className="hero-glow-bg" />
        <div className="landing-container hero-inner">
          <div className="hero-pill-badge">
            <span className="live-dot" />
            <span>Sri Lanka University Network &bull; Spring 2026</span>
          </div>

          <h1 className="hero-main-title">
            One campus. <br />
            <span className="hero-gradient-text">
              Every skill, resource and opportunity &mdash; connected.
            </span>
          </h1>

          <p className="hero-description">
            UniSwap+ turns scattered WhatsApp chats and crowded noticeboards into one
            trusted, intelligent campus ecosystem. Share what you have, request what you
            need, and collaborate with verified peers in seconds.
          </p>

          {/* Quick Search on Hero */}
          <form className="hero-search-box" onSubmit={handleHeroSearch}>
            <Search size={20} className="hero-search-icon" />
            <input
              type="text"
              placeholder="Search for 'Python tutoring', 'Calculus notes', 'Camera'…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="hero-search-btn">
              Find on Campus
            </button>
          </form>

          {/* Call to action buttons */}
          <div className="hero-cta-group">
            <Link to="/register" className="btn btn-primary btn-hero-primary">
              Join Your Campus Network <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-outline btn-hero-secondary">
              Demo Student Login
            </Link>
          </div>

          {/* Trust stats row */}
          <div className="hero-trust-metrics">
            <div className="trust-metric-item">
              <span className="metric-val">1,200+</span>
              <span className="metric-lbl">Verified Students</span>
            </div>
            <div className="metric-divider" />
            <div className="trust-metric-item">
              <span className="metric-val">98%</span>
              <span className="metric-lbl">Exchange Match Rate</span>
            </div>
            <div className="metric-divider" />
            <div className="trust-metric-item">
              <span className="metric-val">100%</span>
              <span className="metric-lbl">Zero Middleman Fees</span>
            </div>
            <div className="metric-divider" />
            <div className="trust-metric-item">
              <span className="metric-val">4.9 ★</span>
              <span className="metric-lbl">Peer Trust Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campus Advertisements & Deals */}
      <section id="campus-deals" className="landing-deals-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="section-pill">
              <Sparkles size={13} /> Campus Exclusives
            </span>
            <h2>Sponsored Deals & Community Announcements</h2>
            <p>Official student discounts, upcoming hackathons, and campus perks.</p>
          </div>
          <AdvertisementBanner />
        </div>
      </section>

      {/* Trending Category Hubs Preview */}
      <section id="hubs" className="landing-hubs-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="section-pill">Trending Hubs</span>
            <h2>Explore Campus by Category</h2>
            <p>Everything you need for student life organized into focused discovery channels.</p>
          </div>

          <div className="landing-hubs-grid">
            {HUB_PREVIEWS.map((hub) => {
              const Icon = hub.icon;
              return (
                <div
                  key={hub.title}
                  className="landing-hub-card"
                  style={{ "--card-accent": hub.color }}
                  onClick={() => navigate("/explore")}
                >
                  <div className="landing-hub-top">
                    <div className="landing-hub-icon" style={{ color: hub.color }}>
                      <Icon size={26} strokeWidth={2.2} />
                    </div>
                    <span className="landing-hub-tag">{hub.tag}</span>
                  </div>
                  <h3>{hub.title}</h3>
                  <p>{hub.desc}</p>
                  <span className="landing-hub-link">
                    Explore channel <ArrowRight size={14} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works / 3-Step Journey */}
      <section id="how-it-works" className="landing-steps-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="section-pill">Simple Workflow</span>
            <h2>How UniSwap+ Works</h2>
            <p>From discovering a resource to safe on-campus exchange in three simple steps.</p>
          </div>

          <div className="landing-steps-grid">
            <div className="landing-step-card">
              <div className="step-number">01</div>
              <div className="step-icon-wrap">
                <BookOpen size={24} />
              </div>
              <h3>Post or Request</h3>
              <p>
                List resources you own, skills you can teach, or post an urgent request
                for study materials, equipment, or project partners.
              </p>
            </div>

            <div className="landing-step-card">
              <div className="step-number">02</div>
              <div className="step-icon-wrap">
                <Zap size={24} />
              </div>
              <h3>Intelligent Smart Matching</h3>
              <p>
                Our explainable algorithm instantly scores overlap across faculties, course
                tags, categories, and keyword proximity so you find the right match faster.
              </p>
            </div>

            <div className="landing-step-card">
              <div className="step-number">03</div>
              <div className="step-icon-wrap">
                <ShieldCheck size={24} />
              </div>
              <h3>Connect & Build Trust</h3>
              <p>
                Direct message your fellow students, arrange a campus handoff, and leave
                reviews that build your verified peer trust score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & University Security Pledge */}
      <section className="landing-security-section">
        <div className="landing-container security-inner">
          <div className="security-content">
            <span className="section-pill">Campus Safe</span>
            <h2>Built Exclusively for University Students</h2>
            <ul className="security-list">
              <li>
                <CheckCircle2 size={18} className="sec-check" />
                <span>
                  <strong>Strictly Verified Accounts:</strong> Only student or faculty credentials
                  can participate in exchanges.
                </span>
              </li>
              <li>
                <CheckCircle2 size={18} className="sec-check" />
                <span>
                  <strong>Transparent Ratings:</strong> Peer reviews after every transaction
                  guarantee accountability.
                </span>
              </li>
              <li>
                <CheckCircle2 size={18} className="sec-check" />
                <span>
                  <strong>No Commercial Markup:</strong> 100% peer-to-peer student deals,
                  swaps, and free knowledge sharing.
                </span>
              </li>
            </ul>
            <div style={{ marginTop: 28 }}>
              <Link to="/register" className="btn btn-primary btn-large">
                Create Your Student Account
              </Link>
            </div>
          </div>

          <div className="security-card-visual">
            <div className="trust-card-mockup">
              <div className="trust-avatar-row">
                <div className="mockup-avatar">MA</div>
                <div>
                  <strong>Mohamed Afrin</strong>
                  <div className="mockup-dept">Faculty of Engineering &bull; 3rd Year</div>
                </div>
                <div className="verified-badge">
                  <ShieldCheck size={14} /> Verified
                </div>
              </div>
              <div className="trust-stars">
                <Star size={16} fill="#F59E0B" color="#F59E0B" />
                <Star size={16} fill="#F59E0B" color="#F59E0B" />
                <Star size={16} fill="#F59E0B" color="#F59E0B" />
                <Star size={16} fill="#F59E0B" color="#F59E0B" />
                <Star size={16} fill="#F59E0B" color="#F59E0B" />
                <span className="trust-score">5.0 (12 exchanges)</span>
              </div>
              <p className="trust-quote">
                &ldquo;Saved me over 15,000 LKR borrowing an oscilloscope for my final year
                project and found a great teammate for the ByteCraft Hackathon!&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Footer Banner */}
      <section className="landing-bottom-cta">
        <div className="landing-container">
          <div className="bottom-cta-box">
            <h2>Ready to transform your campus experience?</h2>
            <p>Join hundreds of students currently sharing, collaborating and succeeding together.</p>
            <div className="bottom-cta-actions">
              <Link to="/register" className="btn btn-primary btn-hero-primary">
                Join UniSwap+ Today &rarr;
              </Link>
              <Link to="/login" className="btn btn-ghost">
                Already registered? Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container footer-container">
          <div className="footer-left">
            <span className="brand-text">
              Uni<span className="brand-accent">Swap</span>+
            </span>
            <p>The student-first campus exchange and collaboration network.</p>
          </div>
          <div className="footer-right">
            <div className="footer-theme-toggle">
              <ThemeToggle showLabel={true} />
            </div>
            <p className="copyright">&copy; 2026 UniSwap+. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
