import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";

const DEMO_ACCOUNTS = [
  { name: "Mohamed Afrin", email: "afrin@uor.lk", role: "Computer Engineering (12 Active Posts)" },
  { name: "Chamath De Silva", email: "chamath@uor.lk", role: "Software Engineering (4th Year)" },
  { name: "Nadeesha Silva", email: "nadeesha@uor.lk", role: "Electrical Engineering (Peer Tutor)" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "afrin@uor.lk", password: "password123" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not log in. Please check credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (email) => {
    setForm({ email, password: "password123" });
    setError("");
    setSubmitting(true);
    try {
      await login(email, "password123");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not log in with demo account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-split-page">
      {/* Top Bar with Brand & Theme Switcher */}
      <div className="auth-nav-header">
        <Link to="/" className="brand">
          <span className="brand-mark">U+</span>
          Uni<span>Swap</span>+
        </Link>
        <div className="auth-nav-actions">
          <ThemeToggle />
          <Link to="/" className="auth-back-link">
            &larr; Back to Campus
          </Link>
        </div>
      </div>

      <div className="auth-split-container">
        {/* Left Side: Campus Visual Hero */}
        <div className="auth-visual-panel">
          <div className="auth-visual-badge">
            <Sparkles size={14} /> Official Campus Exchange Network
          </div>
          <h1>Connect, swap, and learn with your university peers.</h1>
          <p>
            Join 1,200+ students finding study partners, exchanging academic resources,
            sharing tools, and collaborating on projects across faculties.
          </p>

          <div className="auth-perks-list">
            <div className="auth-perk-item">
              <CheckCircle2 size={18} className="perk-icon" />
              <span>Verified university student profiles only</span>
            </div>
            <div className="auth-perk-item">
              <CheckCircle2 size={18} className="perk-icon" />
              <span>Smart matching for academic notes & equipment</span>
            </div>
            <div className="auth-perk-item">
              <CheckCircle2 size={18} className="perk-icon" />
              <span>Direct encrypted campus chat & trusted reviews</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="auth-form-panel">
          <div className="auth-card-modern">
            <div className="auth-card-header">
              <h2>Welcome back</h2>
              <p className="auth-subtitle">Log in with your university credentials.</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="form-modern">
              <div className="input-group">
                <label>University Email</label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="student@university.lk"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="field-icon" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button className="btn btn-primary btn-block btn-auth-submit" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign In to UniSwap+"} <ArrowRight size={17} />
              </button>
            </form>

            {/* Quick 1-Click Demo Accounts */}
            <div className="demo-accounts-box">
              <span className="demo-title">⚡ 1-Click Demo Student Logins:</span>
              <div className="demo-pills-row">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    className="demo-pill-btn"
                    onClick={() => handleQuickLogin(acc.email)}
                    disabled={submitting}
                    title={`Log in as ${acc.name} (${acc.role})`}
                  >
                    👤 <strong>{acc.name}</strong> &bull; {acc.role}
                  </button>
                ))}
              </div>
            </div>

            <div className="auth-card-footer">
              <span>New to UniSwap+?</span>
              <Link to="/register" className="auth-accent-link">
                Create free account &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
