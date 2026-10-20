import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Pencil, X, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../api/api";
import { CategoryThumb, EmptyState, TagPicker } from "../components/components";
import { CATEGORY_OPTIONS, TAG_SUGGESTIONS } from "../constants/formOptions";

const URGENCIES = ["low", "medium", "high"];
const STATUS_OPTIONS = ["open", "matched", "closed"];

const defaultFormState = {
  title: "",
  description: "",
  category: CATEGORY_OPTIONS[0],
  categoryOther: "",
  tags: "",
  urgency: "medium",
  status: "open",
};

export default function MyRequests() {
  const navigate = useNavigate();

  // Requests collection and loading state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(defaultFormState);
  const [createError, setCreateError] = useState("");
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Edit modal state
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState(defaultFormState);
  const [editError, setEditError] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Safe delete confirmation modal state
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Action toast message
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const showToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(""), 4000);
  };

  // Fetch current student's requests from backend API
  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get("/requests/mine");
      setRequests(response.data.requests || []);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  // Client-side validation check
  const validateForm = (data) => {
    if (!data.title || data.title.trim().length < 3) {
      return "Please enter a descriptive title (at least 3 characters).";
    }
    if (!data.description || data.description.trim().length < 10) {
      return "Please provide more details in the description (at least 10 characters).";
    }
    if (data.category === "Other" && (!data.categoryOther || !data.categoryOther.trim())) {
      return "Please specify your custom category.";
    }
    return null;
  };

  // Handle creating a new request (CREATE)
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setCreateError("");

    const validationMsg = validateForm(createForm);
    if (validationMsg) {
      setCreateError(validationMsg);
      return;
    }

    setSubmittingCreate(true);
    try {
      const resolvedCategory =
        createForm.category === "Other" ? createForm.categoryOther.trim() : createForm.category;

      await api.post("/requests", {
        ...createForm,
        category: resolvedCategory,
      });

      setShowCreateForm(false);
      setCreateForm(defaultFormState);
      showToast("Request published successfully!");
      fetchMyRequests();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Could not publish request. Please try again.");
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Open Edit Modal with preloaded data (UPDATE preparation)
  const openEditModal = (request) => {
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
    setEditingItem(request);
  };

  // Handle submitting updated request (UPDATE)
  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    setEditError("");
    const validationMsg = validateForm(editForm);
    if (validationMsg) {
      setEditError(validationMsg);
      return;
    }

    setSubmittingEdit(true);
    try {
      const resolvedCategory =
        editForm.category === "Other" ? editForm.categoryOther.trim() : editForm.category;

      const response = await api.put(`/requests/${editingItem._id}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: resolvedCategory,
        tags: editForm.tags,
        urgency: editForm.urgency,
        status: editForm.status,
      });

      // Update state in place
      setRequests((prev) =>
        prev.map((item) => (item._id === editingItem._id ? response.data.request : item))
      );

      setEditingItem(null);
      showToast("Request updated successfully!");
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update request. Please try again.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Safe delete handler (DELETE)
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/requests/${itemToDelete._id}`);
      setRequests((prev) => prev.filter((item) => item._id !== itemToDelete._id));
      showToast(`"${itemToDelete.title}" deleted safely.`);
      setItemToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Could not delete this request.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      {/* Toast alert banner */}
      {feedbackMessage && (
        <div className="alert alert-success" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
          <CheckCircle2 size={18} />
          <span>{feedbackMessage}</span>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>My Requests</h1>
          <p className="page-subtitle">Track things you are currently looking for help or resources with.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateForm((prev) => !prev)}>
          <Plus size={16} /> {showCreateForm ? "Cancel" : "New request"}
        </button>
      </div>

      {/* CREATE REQUEST INLINE FORM */}
      {showCreateForm && (
        <form className="form form-grid inline-form" onSubmit={handleCreateRequest} style={{ marginBottom: "2rem" }}>
          {createError && (
            <div className="alert alert-error form-span" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={18} />
              <span>{createError}</span>
            </div>
          )}

          <label>
            Category
            <select
              value={createForm.category}
              onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label>
            Urgency Level
            <select
              value={createForm.urgency}
              onChange={(e) => setCreateForm({ ...createForm, urgency: e.target.value })}
            >
              {URGENCIES.map((u) => (
                <option key={u} value={u}>
                  {u.charAt(0).toUpperCase() + u.slice(1)} Urgency
                </option>
              ))}
            </select>
          </label>

          {createForm.category === "Other" && (
            <label className="form-span">
              Custom category
              <input
                required
                placeholder="Type your category name..."
                value={createForm.categoryOther}
                onChange={(e) => setCreateForm({ ...createForm, categoryOther: e.target.value })}
              />
            </label>
          )}

          <label className="form-span">
            Request Title *
            <input
              required
              placeholder="e.g. Need past papers for EC4307 or looking for React co-developer"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            />
          </label>

          <label className="form-span">
            Detailed Description *
            <textarea
              required
              rows={3}
              placeholder="Explain exactly what you need, your deadline, and how others can help..."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            />
          </label>

          <label className="form-span">
            Tags (keyword search helpers)
            <TagPicker
              value={createForm.tags}
              onChange={(tags) => setCreateForm({ ...createForm, tags })}
              suggestions={TAG_SUGGESTIONS}
            />
          </label>

          <button className="btn btn-primary form-span" disabled={submittingCreate}>
            {submittingCreate ? "Publishing request…" : "Post request"}
          </button>
        </form>
      )}

      {/* READ / LIST OF REQUESTS */}
      {loading ? (
        <p className="muted">Loading your requests…</p>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No open requests"
          description="Post what you need help with and let the campus matching engine connect you."
          actionLabel="+ Create your first request"
          onAction={() => setShowCreateForm(true)}
        />
      ) : (
        <div className="grid grid-3">
          {requests.map((request) => (
            <div key={request._id} className="card manage-card">
              {/* Card Action Controls: Edit & Safe Delete */}
              <div className="manage-actions">
                <button
                  type="button"
                  className="manage-btn manage-btn-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(request);
                  }}
                  title="Edit request details"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  className="manage-btn manage-btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemToDelete(request);
                  }}
                  title="Delete request safely"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Card Content with link to Read Detail */}
              <div onClick={() => navigate(`/requests/${request._id}`)} role="button" tabIndex={0}>
                <CategoryThumb category={request.category} />
                <div className="card-body">
                  <div className="card-top">
                    <span className={`badge badge-urgency-${request.urgency}`}>
                      {request.urgency} urgency
                    </span>
                    <span className="card-category">{request.category}</span>
                  </div>
                  <h4>{request.title}</h4>
                  <p className="card-desc">{request.description}</p>
                  <div className="card-footer">
                    <span className={`status-pill status-${request.status}`}>{request.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPDATE (EDIT) MODAL DIALOG */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Request</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingItem(null)}
              >
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
                    placeholder="e.g. exam, past papers, notes"
                    value={editForm.tags}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  />
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingEdit}
                >
                  {submittingEdit ? "Saving changes…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAFE DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="modal-overlay" onClick={() => !deleting && setItemToDelete(null)}>
          <div className="modal-container" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "8px" }}>
                <Trash2 size={20} /> Confirm Deletion
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setItemToDelete(null)}
                disabled={deleting}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to delete this request:</p>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.04)",
                  padding: "0.85rem 1rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  borderLeft: "4px solid #ef4444",
                }}
              >
                {itemToDelete.title}
              </div>
              <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>
                This record will be completely removed from the campus database. This action cannot be undone.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setItemToDelete(null)}
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
