import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Pencil, Trash2, X, AlertCircle } from "lucide-react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  Avatar,
  RatingStars,
  TagList,
  MatchRow,
  CategoryThumb,
  SaveButton,
} from "../components/components";
import { CATEGORY_OPTIONS } from "../constants/formOptions";

const URGENCIES = ["low", "medium", "high"];
const STATUS_OPTIONS = ["open", "matched", "closed"];

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sendStatus, setSendStatus] = useState("");

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Safe delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [reqRes, matchesRes] = await Promise.all([
        api.get(`/requests/${id}`),
        api.get(`/requests/${id}/matches`),
      ]);
      setRequest(reqRes.data.request);
      setMatches(matchesRes.data.matches || []);
    } catch (err) {
      console.error("Failed to load request details:", err);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!request) return <div className="page">Loading request details…</div>;

  const isOwner = request.owner?._id === user?._id;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSendStatus("");
    try {
      await api.post("/messages", {
        receiver: request.owner._id,
        content: messageText,
        relatedRequest: request._id,
      });
      setMessageText("");
      setSendStatus("Message sent — check your Messages inbox.");
    } catch (err) {
      setSendStatus(err.response?.data?.message || "Could not send message.");
    }
  };

  const openEditModal = () => {
    const isStandardCat = CATEGORY_OPTIONS.includes(request.category);

    setEditForm({
      title: request.title || "",
      description: request.description || "",
      category: isStandardCat ? request.category : "Other",
      categoryOther: isStandardCat ? "" : request.category,
      tags: Array.isArray(request.tags) ? request.tags.join(", ") : (request.tags || ""),
      urgency: request.urgency || "medium",
      status: request.status || "open",
    });
    setEditError("");
    setShowEditModal(true);
  };

  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    setEditError("");

    if (!editForm.title || editForm.title.trim().length < 3) {
      setEditError("Title must be at least 3 characters.");
      return;
    }
    if (!editForm.description || editForm.description.trim().length < 10) {
      setEditError("Description must be at least 10 characters.");
      return;
    }

    setSubmittingEdit(true);
    try {
      const resolvedCategory =
        editForm.category === "Other" ? editForm.categoryOther.trim() : editForm.category;

      const res = await api.put(`/requests/${request._id}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: resolvedCategory,
        tags: editForm.tags,
        urgency: editForm.urgency,
        status: editForm.status,
      });

      setRequest(res.data.request);
      setShowEditModal(false);
      loadData();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update request.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/requests/${request._id}`);
      navigate("/my-requests");
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete request.");
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <button className="btn btn-ghost" onClick={() => navigate(-1)}>
        <ChevronLeft size={16} /> Back
      </button>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-hero">
            <CategoryThumb category={request.category} size="large" />
            <SaveButton itemType="request" itemId={request._id} size={20} className="detail-save" />
          </div>

          <div className="detail-top-row">
            <span className={`badge badge-urgency-${request.urgency}`}>{request.urgency} urgency</span>
          </div>
          <h1>{request.title}</h1>
          <p className="card-category">{request.category}</p>
          <p className="detail-desc">{request.description}</p>
          <TagList tags={request.tags} />
          <p className="muted">
            Status: <span className={`status-pill status-${request.status}`}>{request.status}</span>
          </p>

          {/* Owner controls */}
          {isOwner && (
            <div
              style={{
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                borderRadius: "12px",
                padding: "1rem 1.25rem",
                marginTop: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <strong style={{ display: "block", fontSize: "0.95rem" }}>You posted this request</strong>
                <span className="muted" style={{ fontSize: "0.85rem" }}>
                  You have full permission to edit or remove this record.
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" className="btn btn-outline" onClick={openEditModal} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Pencil size={15} /> Edit Request
                </button>
                <button type="button" className="btn-danger" onClick={() => setShowDeleteModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          )}

          {!isOwner && (
            <div className="message-box">
              <h3>Offer to help {request.owner?.name}</h3>
              <form onSubmit={handleSendMessage} className="form">
                <textarea
                  rows={3}
                  required
                  placeholder={`Hi ${request.owner?.name?.split(" ")[0] || "there"}, I can help with "${request.title}"...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button className="btn btn-primary">Send message</button>
              </form>
              {sendStatus && <p className="muted">{sendStatus}</p>}
            </div>
          )}

          <section className="section">
            <h3>Best-matching listings</h3>
            <p className="muted">
              Ranked by shared tags, category and keyword overlap — powered by the UniSwap+ matching engine.
            </p>
            {matches.length === 0 ? (
              <p className="muted">No matching active listings right now.</p>
            ) : (
              <div className="match-list">
                {matches.map((m) => (
                  <MatchRow key={m.item._id} result={m} kind="listing" />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="detail-side">
          <div className="owner-card">
            <Avatar name={request.owner?.name || "User"} color={request.owner?.avatarColor} size={56} />
            <h4>{request.owner?.name}</h4>
            <p className="muted">{request.owner?.department}</p>
            <RatingStars value={request.owner?.ratingAverage || 0} />
            {request.owner?.bio && <p className="owner-bio">{request.owner.bio}</p>}
          </div>
        </aside>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && editForm && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Request</h3>
              <button type="button" className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateRequest}>
              <div className="modal-body">
                {editError && (
                  <div className="alert alert-error" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertCircle size={16} />
                    <span>{editError}</span>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <label>
                    Urgency
                    <select
                      value={editForm.urgency}
                      onChange={(e) => setEditForm({ ...editForm, urgency: e.target.value })}
                    >
                      {URGENCIES.map((u) => (
                        <option key={u} value={u}>
                          {u.charAt(0).toUpperCase() + u.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Status
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  Category
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                {editForm.category === "Other" && (
                  <label>
                    Custom Category
                    <input
                      required
                      value={editForm.categoryOther}
                      onChange={(e) => setEditForm({ ...editForm, categoryOther: e.target.value })}
                    />
                  </label>
                )}

                <label>
                  Title *
                  <input
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </label>

                <label>
                  Description *
                  <textarea
                    required
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </label>

                <label>
                  Tags (comma separated)
                  <input
                    placeholder="e.g. math, notes, project"
                    value={editForm.tags}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  />
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingEdit}>
                  {submittingEdit ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="modal-container" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "8px" }}>
                <Trash2 size={20} /> Delete Request
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to permanently delete this request?</p>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.04)",
                  padding: "0.85rem 1rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  borderLeft: "4px solid #ef4444",
                }}
              >
                {request.title}
              </div>
              <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>
                This record will be completely removed from the database.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Yes, Delete Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
