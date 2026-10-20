import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Pencil, X, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../api/api";
import { CategoryThumb, PriceTag, EmptyState, TagPicker } from "../components/components";
import { CATEGORY_OPTIONS, AVAILABILITY_OPTIONS, TAG_SUGGESTIONS } from "../constants/formOptions";

// Available listing categories & types on campus
const TYPES = ["resource", "skill", "service", "knowledge"];
const STATUS_OPTIONS = ["active", "fulfilled", "closed"];

const defaultFormState = {
  type: "resource",
  title: "",
  description: "",
  category: CATEGORY_OPTIONS[0],
  categoryOther: "",
  tags: "",
  availability: AVAILABILITY_OPTIONS[0],
  availabilityOther: "",
  pricingType: "free",
  price: "",
  status: "active",
};

export default function MyListings() {
  const navigate = useNavigate();

  // State management for listings and loading indicators
  const [listings, setListings] = useState([]);
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

  // Safe delete confirmation state
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Feedback toast message (success notification)
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const showToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(""), 4000);
  };

  // Fetch current student's listings from API
  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/listings/mine");
      setListings(response.data.listings || []);
    } catch (err) {
      console.error("Failed to load listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  // Client-side validation function before dispatching requests
  const validateForm = (data) => {
    if (!data.title || data.title.trim().length < 3) {
      return "Please enter a descriptive title (at least 3 characters).";
    }
    if (!data.description || data.description.trim().length < 10) {
      return "Please write a detailed description (at least 10 characters).";
    }
    if (data.category === "Other" && (!data.categoryOther || !data.categoryOther.trim())) {
      return "Please specify your custom category.";
    }
    if (data.pricingType === "paid") {
      const numericPrice = Number(data.price);
      if (isNaN(numericPrice) || numericPrice < 0 || data.price === "") {
        return "Please enter a valid non-negative price.";
      }
    }
    return null;
  };

  // Handle creating a new listing (CREATE)
  const handleCreateListing = async (e) => {
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
      const resolvedAvailability =
        createForm.availability === "Other"
          ? createForm.availabilityOther.trim()
          : createForm.availability;

      await api.post("/listings", {
        ...createForm,
        category: resolvedCategory,
        availability: resolvedAvailability,
        price: createForm.pricingType === "paid" ? Number(createForm.price) : undefined,
      });

      setShowCreateForm(false);
      setCreateForm(defaultFormState);
      showToast("Listing created successfully!");
      fetchMyListings();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Could not publish listing. Please try again.");
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Open Edit Modal with existing item data (UPDATE preparation)
  const openEditModal = (listing) => {
    const isStandardCat = CATEGORY_OPTIONS.includes(listing.category);
    const isStandardAvail = AVAILABILITY_OPTIONS.includes(listing.availability);

    setEditForm({
      type: listing.type || "resource",
      title: listing.title || "",
      description: listing.description || "",
      category: isStandardCat ? listing.category : "Other",
      categoryOther: isStandardCat ? "" : listing.category,
      tags: Array.isArray(listing.tags) ? listing.tags.join(", ") : (listing.tags || ""),
      availability: isStandardAvail ? listing.availability : "Other",
      availabilityOther: isStandardAvail ? "" : listing.availability,
      pricingType: listing.pricingType || "free",
      price: listing.price !== undefined && listing.price !== null ? String(listing.price) : "",
      status: listing.status || "active",
    });
    setEditError("");
    setEditingItem(listing);
  };

  // Handle submitting updated listing (UPDATE)
  const handleUpdateListing = async (e) => {
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
      const resolvedAvailability =
        editForm.availability === "Other"
          ? editForm.availabilityOther.trim()
          : editForm.availability;

      const response = await api.put(`/listings/${editingItem._id}`, {
        type: editForm.type,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: resolvedCategory,
        availability: resolvedAvailability,
        tags: editForm.tags,
        pricingType: editForm.pricingType,
        price: editForm.pricingType === "paid" ? Number(editForm.price) : undefined,
        status: editForm.status,
      });

      // Update item in local list state immediately
      setListings((prev) =>
        prev.map((item) => (item._id === editingItem._id ? response.data.listing : item))
      );

      setEditingItem(null);
      showToast("Listing updated successfully!");
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update listing. Please try again.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Handle safe record deletion (DELETE)
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/listings/${itemToDelete._id}`);
      setListings((prev) => prev.filter((item) => item._id !== itemToDelete._id));
      showToast(`"${itemToDelete.title}" removed safely.`);
      setItemToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Could not delete this listing.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      {/* Toast banner for user actions */}
      {feedbackMessage && (
        <div className="alert alert-success" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
          <CheckCircle2 size={18} />
          <span>{feedbackMessage}</span>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>My Listings</h1>
          <p className="page-subtitle">Manage everything you are currently offering to fellow students.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateForm((prev) => !prev)}>
          <Plus size={16} /> {showCreateForm ? "Cancel" : "New listing"}
        </button>
      </div>

      {/* CREATE LISTING INLINE FORM */}
      {showCreateForm && (
        <form className="form form-grid inline-form" onSubmit={handleCreateListing} style={{ marginBottom: "2rem" }}>
          {createError && (
            <div className="alert alert-error form-span" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={18} />
              <span>{createError}</span>
            </div>
          )}

          <label>
            Exchange Type
            <select
              value={createForm.type}
              onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </label>

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

          {createForm.category === "Other" && (
            <label className="form-span">
              Custom category
              <input
                required
                placeholder="Type your custom category..."
                value={createForm.categoryOther}
                onChange={(e) => setCreateForm({ ...createForm, categoryOther: e.target.value })}
              />
            </label>
          )}

          <label className="form-span">
            Listing Title *
            <input
              required
              placeholder="e.g. Graphic Calculator Casio fx-991EX or Python Tutoring"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            />
          </label>

          <label className="form-span">
            Detailed Description *
            <textarea
              required
              rows={3}
              placeholder="Describe condition, location on campus, or what you are offering..."
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

          <label>
            Availability
            <select
              value={createForm.availability}
              onChange={(e) => setCreateForm({ ...createForm, availability: e.target.value })}
            >
              {AVAILABILITY_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          {createForm.availability === "Other" && (
            <label>
              Custom Availability Details
              <input
                required
                placeholder="e.g. Weekday evenings only"
                value={createForm.availabilityOther}
                onChange={(e) => setCreateForm({ ...createForm, availabilityOther: e.target.value })}
              />
            </label>
          )}

          <label>
            Pricing Model
            <select
              value={createForm.pricingType}
              onChange={(e) => setCreateForm({ ...createForm, pricingType: e.target.value })}
            >
              <option value="free">Free / Mutual Exchange</option>
              <option value="paid">Paid (Affordable student price)</option>
            </select>
          </label>

          {createForm.pricingType === "paid" && (
            <label>
              Price (LKR) *
              <input
                type="number"
                min="0"
                step="50"
                placeholder="500"
                value={createForm.price}
                onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
              />
            </label>
          )}

          <button className="btn btn-primary form-span" disabled={submittingCreate}>
            {submittingCreate ? "Publishing listing…" : "Publish listing"}
          </button>
        </form>
      )}

      {/* READ / LIST VIEW */}
      {loading ? (
        <p className="muted">Loading your listings…</p>
      ) : listings.length === 0 ? (
        <EmptyState
          title="No listings published yet"
          description="Offer a study resource, calculator, tutoring session, or campus service to help fellow students."
          actionLabel="+ Create your first listing"
          onAction={() => setShowCreateForm(true)}
        />
      ) : (
        <div className="grid grid-3">
          {listings.map((listing) => (
            <div key={listing._id} className="card manage-card">
              {/* Card Action Controls: Edit & Safe Delete */}
              <div className="manage-actions">
                <button
                  type="button"
                  className="manage-btn manage-btn-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(listing);
                  }}
                  title="Edit listing details"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  className="manage-btn manage-btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemToDelete(listing);
                  }}
                  title="Delete listing safely"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Card Content with Link to Read Detail */}
              <div onClick={() => navigate(`/listings/${listing._id}`)} role="button" tabIndex={0}>
                <CategoryThumb category={listing.category} />
                <div className="card-body">
                  <div className="card-top">
                    <span className={`badge badge-${listing.type}`}>{listing.type}</span>
                    <span className="card-category">{listing.category}</span>
                  </div>
                  <h4>{listing.title}</h4>
                  <p className="card-desc">{listing.description}</p>
                  <div className="card-footer">
                    <span className={`status-pill status-${listing.status}`}>{listing.status}</span>
                    <PriceTag
                      pricingType={listing.pricingType}
                      price={listing.price}
                      currency={listing.currency}
                    />
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
              <h3>Edit Listing</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingItem(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateListing}>
              <div className="modal-body">
                {editError && (
                  <div className="alert alert-error" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertCircle size={16} />
                    <span>{editError}</span>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <label>
                    Type
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    >
                      {TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
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
                    placeholder="e.g. python, tutoring, math"
                    value={editForm.tags}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <label>
                    Pricing
                    <select
                      value={editForm.pricingType}
                      onChange={(e) => setEditForm({ ...editForm, pricingType: e.target.value })}
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </label>

                  {editForm.pricingType === "paid" && (
                    <label>
                      Price (LKR)
                      <input
                        type="number"
                        min="0"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      />
                    </label>
                  )}
                </div>
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
              <p>
                Are you sure you want to permanently delete the listing:
              </p>
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
                {deleting ? "Deleting…" : "Yes, Delete Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
