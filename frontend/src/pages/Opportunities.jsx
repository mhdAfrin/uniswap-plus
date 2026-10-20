import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import api from "../api/api";
import { OpportunityCard, EmptyState, TagPicker } from "../components/components";
import { TAG_SUGGESTIONS } from "../constants/formOptions";

const TYPES = ["internship", "event", "project", "scholarship", "competition", "other"];

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "other",
    tags: "",
    deadline: "",
    link: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.get("/opportunities");
      setOpportunities(res.data.opportunities);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/opportunities", form);
      setShowForm(false);
      setForm({ title: "", description: "", type: "other", tags: "", deadline: "", link: "" });
      fetchOpportunities();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not post opportunity.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Opportunities</h1>
          <p className="page-subtitle">Internships, events, competitions and projects from the community.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : <><Plus size={16} /> Post opportunity</>}
        </button>
      </div>

      {showForm && (
        <form className="form form-grid inline-form" onSubmit={handleCreate}>
          {formError && <div className="alert alert-error form-span">{formError}</div>}
          <label>
            Type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            Deadline (optional)
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </label>
          <label className="form-span">
            Title
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="form-span">
            Description
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label className="form-span">
            Tags
            <TagPicker
              value={form.tags}
              onChange={(tags) => setForm({ ...form, tags })}
              suggestions={TAG_SUGGESTIONS}
            />
          </label>
          <label>
            External link (optional)
            <input
              placeholder="https://…"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
          </label>
          <button className="btn btn-primary form-span" disabled={submitting}>
            {submitting ? "Posting…" : "Post opportunity"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="muted">Loading opportunities…</p>
      ) : opportunities.length === 0 ? (
        <EmptyState
          title="No opportunities yet"
          description="Be the first to share an internship, event or project with the community."
          actionLabel="+ Post opportunity"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-2">
          {opportunities.map((op) => (
            <OpportunityCard key={op._id} opportunity={op} />
          ))}
        </div>
      )}
    </div>
  );
}
