import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, BookOpen, GraduationCap, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    studentId: "",
    faculty: "",
    department: "",
    yearOfStudy: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-split-page">
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
        <div className="auth-visual-panel">
          <div className="auth-visual-badge">
            <GraduationCap size={14} /> Join Your Campus Community
          </div>
          <h1>Empowering students to share, learn and achieve more together.</h1>
          <p>
            Create your university account in less than a minute. Unlock course materials,
            borrow hardware gear, and find trusted project teammates.
          </p>

          <div className="auth-perks-list">
            <div className="auth-perk-item">
              <CheckCircle2 size={18} className="perk-icon" />
              <span>Free student-to-student resource swapping</span>
            </div>
            <div className="auth-perk-item">
              <CheckCircle2 size={18} className="perk-icon" />
              <span>Build an accredited campus reputation score</span>
            </div>
            <div className="auth-perk-item">
              <CheckCircle2 size={18} className="perk-icon" />
              <span>Exclusive access to campus competitions & hackathons</span>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-card-modern auth-card-register">
            <div className="auth-card-header">
              <h2>Create your account</h2>
              <p className="auth-subtitle">Join the UniSwap+ network today.</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="form-modern form-grid-modern">
              <div className="input-group">
                <label>Full Name</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Aisha Bandara"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>University Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. aisha@sliit.lk"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Password (min 6 chars)</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Student ID (Optional)</label>
                <input
                  name="studentId"
                  placeholder="e.g. IT21089200"
                  value={form.studentId}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Faculty</label>
                <input
                  name="faculty"
                  placeholder="e.g. Computing / Engineering"
                  value={form.faculty}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Department</label>
                <input
                  name="department"
                  placeholder="e.g. Software Engineering"
                  value={form.department}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group full-span">
                <label>Year of Study (1 - 6)</label>
                <input
                  type="number"
                  name="yearOfStudy"
                  min={1}
                  max={6}
                  placeholder="e.g. 3"
                  value={form.yearOfStudy}
                  onChange={handleChange}
                />
              </div>

              <button className="btn btn-primary btn-block btn-auth-submit full-span" disabled={submitting}>
                {submitting ? "Creating Account…" : "Create Student Account"} <ArrowRight size={17} />
              </button>
            </form>

            <div className="auth-card-footer">
              <span>Already registered?</span>
              <Link to="/login" className="auth-accent-link">
                Sign in &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
